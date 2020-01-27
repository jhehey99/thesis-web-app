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
    precision = 6
    print(f"{title} - Input: {inputName}, Output: {outputName}, Length: {length}")

    # Table Properties
    table_rows = ["Equation", "Coefficient", "Intercept", "MSE", "Score", "Correlation"]
    table_columns = ["Properties"]
    table_bbox = [0.2, -0.6, 0.8, .4]  # left, bottom, width, height
    table_loc = "bottom"

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

    coefficient, intercept = np.round(model.coef_[0], precision), np.round(model.intercept_, precision)
    equation = f"{outputName} = {coefficient}*{inputName} + {intercept}"

    # Dump Trained Model
    filename = f"{trainingType}.joblib"
    filepath = os.path.join(saveDir, filename)
    with open(filepath, "wb") as saveFile:
        dump(model, saveFile)

    # Training Properties
    train_properties = dict()
    train_properties["equation"] = equation
    train_properties["coefficient"] = coefficient
    train_properties["intercept"] = intercept
    train_properties["mse"] = np.round(mean_squared_error(train_y, train_predict_y), precision)
    train_properties["score"] = np.round(r2_score(train_y, train_predict_y), precision)
    train_properties["correlation"] = "TODO"
    print("Training Properties")
    print(train_properties)

    # Plot Training
    plt.figure(1, figsize=(13, 6))
    plt.subplot(121)
    plt.scatter(train_X, train_y, color="blue")
    plt.plot(train_X, train_predict_y, color="red")
    plt.title(f"Training - {title}")
    plt.xlabel(inputName)
    plt.ylabel(outputName)

    # Training Properties Table
    train_cell_text = [[x] for x in train_properties.values()]
    train_properties_table = plt.table(
        cellText=train_cell_text,
        rowLabels=table_rows,
        colLabels=table_columns,
        loc=table_loc,
        bbox=table_bbox
    )

    # Test the model using testing dataset
    test_predict_y = model.predict(test_X)

    # Testing Properties
    # Coefficient, Intercept, Mean Squared Error, Coefficient of determination, TODO: Correlation Coefficient
    test_properties = dict()
    test_properties["equation"] = equation
    test_properties["coefficient"] = coefficient
    test_properties["intercept"] = intercept
    test_properties["mse"] = np.round(mean_squared_error(test_y, test_predict_y), precision)
    test_properties["score"] = np.round(r2_score(test_y, test_predict_y), precision)
    test_properties["correlation"] = "TODO"
    print("Testing Properties")
    print(test_properties)

    # Plot Testing
    plt.subplot(122)
    plt.scatter(test_X, test_y, color='blue')
    plt.plot(test_X, test_predict_y, color="red")
    plt.title(f"Testing - {title}")
    plt.xlabel(inputName)
    plt.ylabel(outputName)

    # Testing Properties Table
    test_cell_text = [[x] for x in test_properties.values()]
    test_properties_table = plt.table(
        cellText=test_cell_text,
        rowLabels=table_rows,
        colLabels=table_columns,
        loc=table_loc,
        bbox=table_bbox
    )

    # Adjust layout to make room for the table:
    plt.subplots_adjust(bottom=0.35)
    plt.show()
