# train_model.py

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MinMaxScaler
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from imblearn.over_sampling import SMOTE
import joblib

# Özellik listesi
selected_features = [
    'RBC', 'AST_1', 'BMI', 'WBC', 'RNA_4',
    'ALT_24', 'Plat', 'ALT_48', 'ALT_12', 'RNA_Base',
    'ALT4', 'ALT_1', 'ALT_36', 'ALT_after_24_w'
]

# Veriyi yükle
df = pd.read_csv("csv/HCV-Egy-Data.csv")
df.columns = df.columns.str.strip().str.replace(' ', '_').str.replace('/', '_')

# Hedef değişkeni hazırla
y = df["Baselinehistological_staging"]
y = y.map(lambda x: 0 if x <= 1 else 1 if x == 2 else 2)

# RNA kolonlarına log dönüşüm
for col in df.columns:
    if "RNA" in col:
        df[col] = np.log1p(df[col])

X = df[selected_features]

# Pipeline: eksik doldurma + ölçekleme
pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="mean")),
    ("scaler", MinMaxScaler())
])
X_processed = pipeline.fit_transform(X)

# SMOTE
smote = SMOTE(random_state=42)
X_resampled, y_resampled = smote.fit_resample(X_processed, y)

# Eğitim
X_train, _, y_train, _ = train_test_split(
    X_resampled, y_resampled, test_size=0.2, random_state=42, stratify=y_resampled
)

model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight="balanced")
model.fit(X_train, y_train)

# Model ve pipeline'ı kaydet
joblib.dump(model, "model.pkl")
joblib.dump(pipeline, "pipeline.pkl")

print("✅ Model ve pipeline başarıyla kaydedildi.")
