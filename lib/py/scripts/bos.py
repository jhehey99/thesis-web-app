import sys
import json
import numpy as np
import matplotlib.pyplot as plt
import scipy.signal as signal


figNum = 1


def newFigure():
    global figNum
    if figNum > 1:
        plt.tight_layout()
    fig = plt.figure(figNum, figsize=(10, 6))
    figNum += 1
    return fig


def readTimeValuePairs(filePath):
    print(f"Read - Path: {filePath}")
    f = open(filePath)
    count, times, values = 0, [], []

    for line in f:
        t, v = [int(x) for x in line.strip().split(',')]
        times.append(t)
        values.append(v)
        count += 1

    f.close()
    npTimes, npValues = np.array(times), np.array(values)
    return [count, npTimes, npValues]


print("\n##################################################\n")
if len(sys.argv) > 1:
    print("Py Process - BOS - Node")
    print("--------------------------------------------------")

    # parse arguments
    dataPath = sys.argv[1]
    config = json.loads(sys.argv[2]).items()

    print(f"Config - DataPath: {dataPath}")
    for key, val in config:
        print(f"Config - {key}: {val}")

    print("--------------------------------------------------")
    # Read input data
    IR, RED = 0, 1
    print("Read - PPG Arm IR")
    irPath = f"{dataPath}/{config['dataFiles'][IR]}"
    irCount, irTimes, irValues = readTimeValuePairs(irPath)
    print(f"Read - PPG Arm IR - Count: {irCount}")
    print("Read - PPG Arm Red")
    redPath = f"{dataPath}/{config['dataFiles'][RED]}"
    redCount, redTimes, redValues = readTimeValuePairs(redPath)
    print(f"Read - PPG Arm Red - Count: {redCount}")

    print("--------------------------------------------------")
    # Input Signal Matching
    print("Preprocessing - Input Signal Matching")
    timeDelay = 300  # ms
    keyTime, keyIndex = redTimes[0], 0

    # Find the index where signal has settled
    for i in range(redCount):
        time, value = redTimes[i], redValues[i]
        if value == 0:
            keyTime = time

        if time >= (keyTime + timeDelay):
            keyIndex = i
            break

    # Get red data points after the key index
    redTimes = np.array(redTimes[keyIndex:])
    redValues = np.array(redValues[keyIndex:])
    redCount = min(len(redTimes), len(redValues))

    # Get same count from ir signal by stripping "<<" and ">>" - << | ... | >>
    if irCount > redCount:
        countDiffHalf = (irCount - redCount) // 2
        irTimes = np.array(irTimes[countDiffHalf:irCount-countDiffHalf])
        irValues = np.array(irValues[countDiffHalf:irCount-countDiffHalf])
        irCount = min(len(irTimes), len(irValues))
        # TODO: What if baliktad, redCount > irCount

    print(f"Preprocessing - KeyTime: {keyTime}, KeyIndex: {keyIndex}, \
          RedCount: {redCount}, IRCount: {irCount}")

    print("--------------------------------------------------")
    # Processing
    print(f"Processing - {config["name"]}")
    figures = []
    AC, DC = 0, 1
    irComponents, redComponents = [], []
    inputData = np.array([[irCount, irTime, irValues],
                          [redCount, redTimes, redValues]])

    for inputIndex, data in enumerate(inputData):
        dataName = "IR" if inputIndex == 0 else "RED"
        print(f"Processing - {dataName}")
        inputCount, inputTime, inputValue = data
        subplotLoc = 411

        # ------------------------------------------------------------------
        # Input Signal
        print("Plotting - Input Signal")
        fig = newFigure()
        figures.append(fig)
        plt.subplot(subplotLoc)
        subplotLoc += 1
        plt.title(f"{dataName} Input Signal")
        plt.ylabel("ADC Value")
        plt.xlabel("Time (ms)")
        plt.plot(inputTime, inputValue)
        plt.ticklabel_format(style='sci', axis='x', scilimits=(0, 0))

        # ------------------------------------------------------------------
        # Filter Input Signal
        print("Processing - Filter Input Signal")
        T = 5
        Fs = int(round(inputCount / T))

        # Low Pass Filter
        lpSos = signal.butter(10, 5, 'lowpass', fs=Fs, output='sos')
        lpVal = np.round(signal.sosfiltfilt(
            lpSos, inputValue), 4)  # zero-phase
        filteredValue = lpVal

        # Plot Filtered Signal
        print("Plotting - Filtered Signal")
        plt.subplot(subplot_loc)
        subplotLoc += 1
        plt.title("Pre-processed Signal")
        plt.ylabel("ADC Value")
        plt.xlabel("Time (ms)")
        plt.plot(inputTime, filteredValue)
        plt.ticklabel_format(style='sci', axis='x', scilimits=(0, 0))

        # ------------------------------------------------------------------
        # Prominence Finding
        print("Processing - Prominence Finding")
        peaks, _ = signal.find_peaks(filteredValue)
        prominences = signal.peak_prominences(filteredValue, peaks)[0]

        # ------------------------------------------------------------------
        # AC Component Finding
        print("Processing - AC Component Finding")
        promAveHalf = np.average(prominences) / 2
        acPoints = [peaks[i] for i, prominence in enumerate(
            prominences) if prominence > promAveHalf]
        acComponents = [
            prominence for prominence in prominences if prominence > promAveHalf]

        # ------------------------------------------------------------------
        # DC Component Finding
        print("Processing - DC Component Finding")
        invertedValue = filteredValue * -1
        invertedPeaks, _ = signal.find_peaks(invertedValue)

        # Get DC Components after each AC Component
        dcPoints = []
        dcIndex = 0
        for acPeak in acPoints:
            while dcIndex < len(invertedPeaks) and invertedPeaks[dcIndex] < acPeak:
                dcIndex += 1

            if dcIndex < len(invertedPeaks):
                dcPoints.append(invertedPeaks[dcIndex])

        # ------------------------------------------------------------------
        # AC - DC Component Matching
        print("Processing - AC - DC Component Matching")
        referencePoint = dcPoints[0]

        print("Processing - Get ac points after the first dc point on the left")
        finalAcPoints, finalAcComponents = [], []
        if len(dcPoints) > 0:
            firstDc = dcPoints[0]
            # Get indices of AC Points after the first DC Point
            acIndices = [i for i in range(
                len(acPoints)) if acPoints[i] > firstDc]
            finalAcPoints = [acPoints[i] for i in acIndices]
            finalAcComponents = [round(acComponents[i], 4) for i in acIndices]

        print("Processing - Get dc points before the last ac point on the right")
        finalDcPoints = []
        if len(finalAcPoints) > 1:
            lastAc = finalAcPoints[-1]
            finalDcPoints = [dcp for dcp in dcPoints if dcp < lastAc]

        # ------------------------------------------------------------------
        # Get AC and DC Component Time and Values
        print("Processing - Get AC and DC Component Time and Values")
        finalAcTimes, finalAcValues = inputTime[finalAcPoints], filteredValue[finalAcPoints]
        finalAcMin = finalAcValues - finalAcComponents
        finalDcTimes, finalDcComponents = inputTime[finalDcPoints], filteredValue[finalDcPoints]

        # Store the AC and DC Components
        if inputIndex == 0:
            irComponents.append(finalAcComponents)
            irComponents.append(finalDcComponents)
        else:
            redComponents.append(finalAcComponents)
            redComponents.append(finalDcComponents)

        # ------------------------------------------------------------------
        # Plot AC Components
        print("Plotting - AC Components")
        plt.subplot(subplotLoc)
        subplotLoc += 1
        plt.title("AC Components")
        plt.plot(inputTime, filteredValue)
        plt.plot(finalAcTimes, finalAcValues, 'x', color='g')
        plt.plot(finalAcTimes, finalAcMin, 'x', color='r')
        plt.vlines(x=finalAcTimes, ymin=finalAcMin, ymax=finalAcValues)
        plt.ticklabel_format(style='sci', axis='x', scilimits=(0, 0))

        # ------------------------------------------------------------------
        # Plot DC Components
        print("Plotting - DC Components")
        plt.subplot(subplotLoc)
        subplotLoc += 1
        plt.title("DC Components")
        plt.plot(inputTime, filteredValue)
        plt.plot(finalDcTimes, finalDcComponents, 'x', color='r')
        plt.ticklabel_format(style='sci', axis='x', scilimits=(0, 0))
        plt.tight_layout()

        # ------------------------------------------------------------------
        # Saving Figure
        # TODO: Get figure filename from the config
        print("Figure - Saving")
        figureFilename = "mamamo.svg"
        plt.tight_layout
        plt.savefig(figureFilename, format="svg", bbox_inches='tight')

    # ------------------------------------------------------------------
    # Component Properties
    print(f"Properties - IR Components - {irComponents}")
    print(f"Properties - Red Components - {redComponents}")

    # Get IR Ratio
    irAcAve = np.round(np.average(irComponents[AC]), 4)
    irDcAve = np.round(np.average(irComponents[DC]), 4)
    irRatio = np.round(irAcAve / irDcAve, 4)
    print(
        f"Properties - IR Average - AC: {irAcAve}, DC: {irDcAve}, Ratio: {irRatio}")

    # Get Red Ratio
    redAcAve = np.round(np.average(redComponents[AC]), 4)
    redDcAve = np.round(np.average(redComponents[DC]), 4)
    redRatio = np.round(redAcAve / redDcAve, 4)
    print(
        f"Properties - Red Average - AC: {redAcAve}, DC: {redDcAve}, Ratio: {redRatio}")

    # Get IR / Red Ratio
    irRedRatio = np.round(irRatio / redRatio, 4)
    print(f"Properties - IR/Red Ratio: {irRedRatio}")


print("\n##################################################\n")
exit()
