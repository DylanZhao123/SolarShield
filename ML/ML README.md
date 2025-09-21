# SolarShield
CDC Grad-level Project - SolarShield

This machine learning system predicts solar flare intensity and assesses infrastructure risks using NASA's DONKI (Database Of Notifications, Knowledge, Information) solar flare data. The system aims to provide early warning capabilities for space weather events that could impact satellites, aviation, and power grid operations.
Dataset

Source: NASA DONKI FLR (Solar Flare) API
Time Range: 2019-2024 (complete solar activity cycle)
Records: 2,026 solar flare events
Features: 24 engineered features including:

Solar flare intensity (X-ray flux)
Duration and temporal characteristics
Solar position coordinates (latitude, longitude)
Regional activity statistics
Event characteristics and metadata




Machine Learning Architecture

Model 1: Solar Flare Intensity Predictor
Algorithm: RandomForestRegressor (200 estimators)
Purpose: Predict X-ray peak flux (W/m²) and classify flare classes (A/B/C/M/X)
Input: 24 engineered features
Output: Continuous intensity values + discrete classification

Model 2: Infrastructure Risk Scorer
Algorithm: XGBClassifier (300 estimators)
Purpose: Assess infrastructure impact risks (0-100 scale)
Input: Same 24 features + intensity predictions
Output: 5-level risk classification + sector-specific scores

Model 3: Integrated Prediction System
Architecture: Combined pipeline integrating Models 1 & 2
Features: Real-time risk assessment, automated alerts, operational recommendations
Output: Comprehensive threat analysis with actionable guidance

Validation Strategy
Temporal Split: 2019-2023 training, 2024 testing (realistic time-series validation)
Cross-Validation: 5-fold CV on training set
Metrics: Precision/Recall for classification, MAE/R² for regression
Target: >85% major event detection accuracy (industry standard)

Performance Results
Solar Flare Intensity Prediction
R² Score: 0.939
Mean Absolute Error: 8.10e-07 W/m²
Classification Accuracy: 87.1%
Major Event Recall: 87.3% (exceeds 85% target)

Infrastructure Risk Assessment
Classification Accuracy: 97.8%
Cross-validation F1-Score: 90.8%
Risk Category Precision: >90% for all levels

Integrated System Performance
Overall Accuracy: 87.1%
Major Event Detection: 87.3% (903/1,036 events correctly identified)
Success Criteria: PASSED (>85% threshold achieved)