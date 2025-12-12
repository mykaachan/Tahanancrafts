import pandas as pd
import numpy as np
from datetime import timedelta
from django.utils import timezone
from statsmodels.tsa.arima.model import ARIMA
# optionally: from pmdarima import auto_arima  (if you want auto model selection)
from products.models import Order, OrderItem
from django.conf import settings

def build_sales_series(product_id=None, by="monthly"):
    """
    Aggregate delivered orders into a time series.
    - product_id: if provided, sum quantities or sales for that product only.
    - by: "daily" or "monthly" (defaults monthly)
    Returns pandas.Series indexed by pd.DatetimeIndex (period end)
    """
    # use delivered orders only (adjust if you want other statuses)
    orders = Order.objects.filter(status=Order.STATUS_DELIVERED).order_by("created_at")

    if product_id:
        # find orderitems for delivered orders that match product
        items = OrderItem.objects.filter(order__in=orders, product_id=product_id)
        if not items.exists():
            return pd.Series(dtype=float)
        # Build a DataFrame: order.created_at, subtotal or quantity or price*qty
        rows = []
        for it in items.select_related("order"):
            dt = it.order.created_at
            revenue = float(it.price * it.quantity)
            rows.append({"date": pd.to_datetime(dt), "value": revenue})
        df = pd.DataFrame(rows)
    else:
        # overall sales: sum grand_total per order (delivered ones)
        rows = []
        for o in orders:
            dt = o.created_at
            rows.append({"date": pd.to_datetime(dt), "value": float(o.grand_total)})
        df = pd.DataFrame(rows)

    if df.empty:
        return pd.Series(dtype=float)

    df = df.set_index("date").sort_index()
    if by == "monthly":
        # resample per month (month end) summing values
        s = df["value"].resample("M").sum()
    else:
        s = df["value"].resample("D").sum()

    # fill missing periods with 0 — ARIMA wants a regular series
    s = s.asfreq(s.index.freq).fillna(0.0)
    return s


def fit_arima_series(series: pd.Series, order=(1,1,1), steps=12, enforce_stationarity=False, enforce_invertibility=False):
    """
    Fit ARIMA and return forecasts and conf intervals.
    - series: pandas Series indexed by datetime (regular freq)
    - order: (p,d,q)
    - steps: forecast horizon (int)
    Returns dict with forecast (date->value), conf_int (date->[low, high]), aicc, model_summary (string)
    """
    s = series.dropna().astype(float)

    if s.empty or len(s) < max(5, sum(order)+1):
        raise ValueError("Time series too short for ARIMA. Need more data points.")

    model = ARIMA(s, order=order, enforce_stationarity=enforce_stationarity, enforce_invertibility=enforce_invertibility)
    fit = model.fit()
    # try to get aicc, fall back to None
    aicc = getattr(fit, "aicc", None)

    pred = fit.get_forecast(steps=steps)
    mean = pred.predicted_mean
    ci = pred.conf_int()

    # Format index as ISO date strings (end of period)
    forecast = {str(idx.date() if hasattr(idx, "date") else idx): float(v) for idx, v in zip(mean.index, mean.values)}
    conf_int = {}
    for idx in ci.index:
        low = float(ci.loc[idx].iloc[0])
        high = float(ci.loc[idx].iloc[1])
        conf_int[str(idx.date() if hasattr(idx, "date") else idx)] = [low, high]

    return {
        "forecast": forecast,
        "conf_int": conf_int,
        "aicc": aicc,
        "model_summary": fit.summary().as_text()
    }
