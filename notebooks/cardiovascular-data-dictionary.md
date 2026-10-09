# Cardiovascular Disease Risk Prediction — Data Dictionary

Source: processed `cardio_data_processed.csv` from the [Kaggle cardiovascular disease dataset](https://www.kaggle.com/datasets/colewelkins/cardiovascular-disease).

The processed file used in the notebook contains 68,205 records and 17 columns.

| Variable | Description | Type / coding | Modeling role |
|---|---|---|---|
| `id` | Row or record identifier. It is not a clinical predictor. | Integer identifier | Excluded |
| `age` | Age recorded in days in the source dataset. | Numeric, days | Excluded; use `age_years` |
| `gender` | Gender category supplied by the dataset. | Categorical code (1 or 2) | Predictor; one-hot encoded |
| `height` | Patient height. | Numeric, centimetres | Predictor |
| `weight` | Patient weight. | Numeric, kilograms | Predictor in the full feature set |
| `ap_hi` | Systolic blood pressure. | Numeric, mmHg | Predictor |
| `ap_lo` | Diastolic blood pressure. | Numeric, mmHg | Predictor |
| `cholesterol` | Cholesterol category. | 1 = normal; 2 = above normal; 3 = well above normal | Predictor; one-hot encoded |
| `gluc` | Blood glucose category. | 1 = normal; 2 = above normal; 3 = well above normal | Predictor; one-hot encoded |
| `smoke` | Recorded smoking status. | 0 = no; 1 = yes | Predictor; one-hot encoded |
| `alco` | Recorded alcohol consumption. | 0 = no; 1 = yes | Predictor; one-hot encoded |
| `active` | Recorded physical activity status. | 0 = no; 1 = yes | Predictor; one-hot encoded |
| `cardio` | Recorded cardiovascular disease status. | 0 = absent; 1 = present | Target |
| `age_years` | Age converted from days to years in the processed dataset. | Numeric, years | Predictor; used instead of `age` |
| `bmi` | Body mass index derived from height and weight. | Numeric, kg/m² | Predictor |
| `bp_category` | Blood pressure category derived from systolic and diastolic readings. | Category label | Used in EDA and the full model feature set; one-hot encoded |
| `bp_category_encoded` | Duplicate category field in this processed file; observed values are labels, despite the column name. | Category label | Excluded as duplicate |

## Data handling notes

- `id` is excluded because it is an identifier.
- `age_years` is used instead of `age` to avoid duplicate representations of age.
- `bp_category_encoded` is excluded because it duplicates `bp_category`.
- `bp_category` is derived from `ap_hi` and `ap_lo`, so it may overlap with the original readings.
- Categorical columns are one-hot encoded. The data is split into stratified 80% training and 20% test sets using `random_state=1`.
- This project is for educational and portfolio purposes only and is not a clinical diagnostic tool.
