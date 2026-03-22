# PRACTICA MACHINE LEARNING
# ------------- Paso 1: Preparacion de datos y division train/test

import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import train_test_split, cross_val_score

df = pd.read_csv("airbnb-listings-extract.csv", sep=";", low_memory=False)

# Arreglo basico para que Price sea numerico y sin nulos
df["Price"] = (
	df["Price"].astype(str)
	.str.replace("$", "", regex=False)
	.str.replace(",", "", regex=False)
)
df["Price"] = pd.to_numeric(df["Price"], errors="coerce")
df = df.dropna(subset=["Price"])

X = df.drop(columns=["Price"])
y = df["Price"]

# Importante (como dijo el profesor):
# La division train/test se hace aqui al principio,
# antes de seguir preprocesando y modelando.
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Tamaño train:", X_train.shape)
print("Tamaño test: ", X_test.shape)

# ------------- Paso 2: Analisis exploratorio

# a. Head, describe, dtypes
# Veo las primeras filas, los tipos de cada columna y un resumen estadistico basico
print(df.head())
print(df.dtypes)
print(df.describe())

# b. Outliers
# Uso un boxplot para ver si hay precios muy raros o extremos
df["Price"].plot.box()
plt.title("Boxplot de Price")
plt.show()

# Tambien lo calculo con IQR: valores fuera de ese rango son outliers
Q1 = df["Price"].quantile(0.25)
Q3 = df["Price"].quantile(0.75)
IQR = Q3 - Q1
outliers = df[(df["Price"] < Q1 - 1.5 * IQR) | (df["Price"] > Q3 + 1.5 * IQR)]
print("Numero de outliers en Price:", len(outliers))

# c. Correlacion
# Veo que columnas numericas se parecen mas al precio
# Cuanto mas cerca de 1 o -1, mas relacion tiene con Price
correlacion = df.select_dtypes(include="number").corr()["Price"].sort_values(ascending=False)
print(correlacion)

# -----------------------  3.  Preprocesamiento: 
# a. Eliminacion de variables
# Voy a quitar columnas con muchos valores nulos porque aportan poca informacion
# No uso metodos mas avanzados porque quiero hacerlo de forma simple
porcentaje_nulos = X_train.isnull().mean()
columnas_eliminar = porcentaje_nulos[porcentaje_nulos > 0.5].index

X_train = X_train.drop(columns=columnas_eliminar)
X_test = X_test.drop(columns=columnas_eliminar)

print("Columnas eliminadas por muchos nulos:", len(columnas_eliminar))

# b. Generacion de variables
# Creo una variable muy facil: suma de habitaciones y baños
if "Bedrooms" in X_train.columns and "Bathrooms" in X_train.columns:
	X_train["Rooms_plus_bathrooms"] = X_train["Bedrooms"].fillna(0) + X_train["Bathrooms"].fillna(0)
	X_test["Rooms_plus_bathrooms"] = X_test["Bedrooms"].fillna(0) + X_test["Bathrooms"].fillna(0)
	print("Variable nueva creada: Rooms_plus_bathrooms")

# Resumen rapido de como quedan los datos despues del preprocesamiento
print("Tamano de X_train despues del preprocesamiento:", X_train.shape)
print("Tamano de X_test despues del preprocesamiento:", X_test.shape)

# -----------------------  4.  Modelado: 
# a. Cross validation
# Para hacerlo facil, me quedo solo con las columnas numericas
x_train_num = X_train.select_dtypes(include="number").fillna(0)
x_test_num = X_test.select_dtypes(include="number").fillna(0)

# Creo dos modelos sencillos para comparar
modelo1 = LinearRegression()
modelo2 = RandomForestRegressor(random_state=42)

# Hago una validacion cruzada simple
score1 = cross_val_score(modelo1, x_train_num, y_train, cv=3, scoring="neg_mean_absolute_error")
score2 = cross_val_score(modelo2, x_train_num, y_train, cv=3, scoring="neg_mean_absolute_error")

print("MAE medio modelo 1:", -score1.mean())
print("MAE medio modelo 2:", -score2.mean())

# b. Evaluacion
# Entreno los dos modelos y comparo sus resultados en test
modelo1.fit(x_train_num, y_train)
pred1 = modelo1.predict(x_test_num)

modelo2.fit(x_train_num, y_train)
pred2 = modelo2.predict(x_test_num)

mae1 = mean_absolute_error(y_test, pred1)
rmse1 = np.sqrt(mean_squared_error(y_test, pred1))

mae2 = mean_absolute_error(y_test, pred2)
rmse2 = np.sqrt(mean_squared_error(y_test, pred2))

print("Resultados modelo 1")
print("MAE:", mae1)
print("RMSE:", rmse1)

print("Resultados modelo 2")
print("MAE:", mae2)
print("RMSE:", rmse2)

if rmse1 < rmse2:
	mejor_modelo = "modelo 1"
else:
	mejor_modelo = "modelo 2"

print("Mejor modelo:", mejor_modelo)

# -----------------------  5.  Conclusión: escrita, no numérica; un par de líneas es más que suficiente.
# Conclusión final (comentada y en lenguaje simple):
# 1) Se trabajo con los datos limpios de Price y se hizo la division train/test desde el inicio.
# 2) Se detectaron outliers en Price con IQR.
# 3) Se eliminaron columnas con muchos nulos y se creo una variable sencilla.
# 4) Se compararon dos modelos basicos con MAE y RMSE.
# 5) El mejor modelo final es el que tiene menor RMSE.

print("CONCLUSION")
print("Filas utiles finales:", len(df))
print("Outliers en Price:", len(outliers))
print("Train final:", X_train.shape)
print("Test final:", X_test.shape)
print("Modelo 1 -> MAE:", round(mae1, 2), "RMSE:", round(rmse1, 2))
print("Modelo 2 -> MAE:", round(mae2, 2), "RMSE:", round(rmse2, 2))
print("Mejor modelo final:", mejor_modelo)

"""
Conclusión: El dataset tiene mezcla de variables numéricas y de texto, y después del preprocesamiento se eliminaron 9 columnas con muchos nulos, quedando un tamaño de train y test adecuado para modelar.
Se detectaron 952 outliers en Price, por lo que hay bastante dispersión en precios y algunos alojamientos muy por encima de la mayoría.
Las variables más relacionadas con Price fueron Weekly Price, Monthly Price, Cleaning Fee y Accommodates, así que tienen más peso para predecir el precio final.
"""