"""
Run this to (re)train the risk model after the data pipeline has populated
oil_prices / geo_events.

Usage:
    python -m ml.train_risk_model
"""
from app.database import SessionLocal
from app.services.risk_engine import train_model, load_model, run_backtest

if __name__ == "__main__":
    db = SessionLocal()
    try:
        metrics = train_model(db)
        print(f"Trained. R^2 on holdout: {metrics['r2_test']:.3f} over {metrics['n_samples']} samples")

        model, feature_names = load_model()
        backtest = run_backtest(db, model, feature_names)
        print(f"Backtest complete — {len(backtest)} rows written to backtest_results")
    finally:
        db.close()
