import sys
import json
from sklearn import linear_model, datasets
import matplotlib.pyplot as plt
from joblib import dump, load
import os
import math
import numpy as np
from sklearn.metrics import mean_squared_error, r2_score


if len(sys.argv) > 1:
    recordType = sys.argv[1]
    config = json.loads(sys.argv[2])
    inputName = config["inputName"]
    outputName = config["outputName"]
    saveDir = config["saveDir"]
    trainingType = config["trainingType"]
    title = config["title"]
    data = config["data"]
    length = len(data)
    print(f"{title} - Input: {inputName}, Output: {outputName}, Length: {length}")

    # Separate Training and Testing Datasets, 80% is for Training. Others is Testing
    train_len = math.floor(length * 0.80)
    test_len = length - train_len
    print(f"Training Length: {train_len}, Testing Length: {test_len}")

    # Shuffle Data
    data_X, data_y = [], []
    for i in range(length):
        data_X.append([data[i][0]])
        data_y.append(data[i][1])

    data_X, data_y = np.array(data_X), np.array(data_y)
    indices = np.arange(data_y.shape[0])
    np.random.seed(69)
    np.random.shuffle(indices)
    data_X, data_y = data_X[indices], data_y[indices]

    # Get Training Data
    train_X, train_y = [], []
    for i in range(train_len):
        train_X.append(data_X[i])
        train_y.append(data_y[i])

    train_X, train_y = np.array(train_X), np.array(train_y)

    # Get Testing Data
    test_X, test_y = [], []
    for i in range(train_len, length, 1):
        test_X.append(data_X[i])
        test_y.append(data_y[i])

    test_X, test_y = np.array(test_X), np.array(test_y)

    # Start Trainnig
    model = linear_model.LinearRegression()
    model.fit(train_X, train_y)
    train_predict_y = model.predict(train_X)

    # Training Properties
    train_properties = dict()
    train_properties["coefficients"] = model.coef_
    train_properties["intercept"] = model.intercept_
    train_properties["mse"] = mean_squared_error(train_y, train_predict_y)
    train_properties["score"] = r2_score(train_y, train_predict_y)
    print("Training Properties")
    print(train_properties)

    # Plot Trained Model
    plt.figure()
    plt.scatter(train_X, train_y, color="blue")
    plt.plot(train_X, train_predict_y, color="red")
    plt.title(f"Training - {title}")
    plt.xlabel(inputName)
    plt.ylabel(outputName)

    # # Dump Trained Model
    filename = f"{trainingType}.joblib"
    filepath = os.path.join(saveDir, filename)
    with open(filepath, "wb") as saveFile:
        dump(model, saveFile)

    # # Test the model using testing dataset
    test_predict_y = model.predict(test_X)

    plt.figure()
    plt.scatter(test_X, test_y, color='blue')
    plt.plot(test_X, test_predict_y, color="red")
    plt.title(f"Testing - {title}")
    plt.xlabel(inputName)
    plt.ylabel(outputName)

    # Properties
    # Root Mean Squared Error
    # Coefficients and Intercept
    # Coefficient of determination
    # Correlation Coefficient
    test_properties = dict()
    test_properties["coefficients"] = model.coef_
    test_properties["intercept"] = model.intercept_
    test_properties["mse"] = mean_squared_error(test_y, test_predict_y)
    test_properties["score"] = r2_score(test_y, test_predict_y)
    print("Testing Properties")
    print(test_properties)

    plt.show()
