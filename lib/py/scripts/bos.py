import sys
import json
import math
import numpy as np
import matplotlib.pyplot as plt
import scipy.signal as signal
from scipy.interpolate import interp1d


figNum = 1


def newFigure():
    global figNum
    if figNum > 1:
        plt.tight_layout()
    fig = plt.figure(figNum, figsize=(10, 6))
    figNum += 1
    return fig


def readTimeValuePairs(filePath):
    # print(f"Read - Path: {filePath}")
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


# print("\n##################################################\n")
if len(sys.argv) > 1:
    # print("Py Process - BOS - Node")
    # print("--------------------------------------------------")

    # Parse Config Arguments
    config = json.loads(sys.argv[1])
    title = config['title']
    rawDataPath = config["rawDataPath"]
    dataFiles = config['dataFiles']
    pyResultsPath = config['pyResultsPath']
    figureNames = config['figureNames']
    figureType = config['figureType']
    duration = int(config['duration'])

    # print(f"Config - DataPath: {rawDataPath}")
    for key, val in config.items():
        # print(f"Config - {key}: {val}")

    # print("--------------------------------------------------")
    # Read input data
    IR, RED = 0, 1
    # print("Read - PPG Arm IR")
    irPath = f"{rawDataPath}/{dataFiles[IR]}"
    irCount, irTimes, irValues = readTimeValuePairs(irPath)
    # print(f"Read - PPG Arm IR - Count: {irCount}")
    # print("Read - PPG Arm Red")
    redPath = f"{rawDataPath}/{dataFiles[RED]}"
    redCount, redTimes, redValues = readTimeValuePairs(redPath)
    # print(f"Read - PPG Arm Red - Count: {redCount}")

    # print("--------------------------------------------------")
    # Input Signal Matching
    # print("Preprocessing - Input Signal Matching")
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
        irTimes = np.array(irTimes[countDiffHalf:irCount - countDiffHalf])
        irValues = np.array(irValues[countDiffHalf:irCount - countDiffHalf])
        irCount = min(len(irTimes), len(irValues))
        # TODO: What if baliktad, redCount > irCount

    # Interpolate signal
    interpolationMultiplier = duration * 100
    irInterpolationCount = math.ceil(irCount / interpolationMultiplier) * interpolationMultiplier
    irInterpolation = interp1d(irTimes, irValues)
    irTimes = np.linspace(irTimes[0], irTimes[-1], num=irInterpolationCount)
    irValues = irInterpolation(irTimes)
    # print(f"Interpolate - IR Signal from {irCount} to {irInterpolationCount} Data Points")

    redInterpolationCount = math.ceil(redCount / interpolationMultiplier) * interpolationMultiplier
    redInterpolation = interp1d(redTimes, redValues)
    redTimes = np.linspace(redTimes[0], redTimes[-1], num=redInterpolationCount)
    redValues = redInterpolation(redTimes)
    # print(f"Interpolate - Red Signal from {redCount} to {redInterpolationCount} Data Points")

    # print(f"Preprocessing - KeyTime: {keyTime}, KeyIndex: {keyIndex}, RedCount: {redCount}, IRCount: {irCount}")

    # print("--------------------------------------------------")
    # Processing
    # print(f"Processing - {title}")
    figures = []
    AC, DC = 0, 1
    irComponents, redComponents = [], []
    inputData = np.array([[irCount, irTimes, irValues], [redCount, redTimes, redValues]])

    for inputIndex, data in enumerate(inputData):
        dataName = "IR" if inputIndex == 0 else "RED"
        # print(f"Processing - {dataName}")
        inputCount, inputTime, inputValue = data
        subplotLoc = 411

        # ------------------------------------------------------------------
        # Input Signal
        # print("Plotting - Input Signal")
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
        # print("Processing - Filter Input Signal")
        T = 5
        Fs = int(round(inputCount / T))

        # Low Pass Filter
        lpSos = signal.butter(10, 5, 'lowpass', fs=Fs, output='sos')
        filteredValue = np.round(signal.sosfiltfilt(lpSos, inputValue), 4)  # zero-phase
        minValue, maxValue = 0.0001, 1024
        filteredValue = (filteredValue - minValue) / (maxValue - minValue)

        # Plot Filtered Signal
        # print("Plotting - Filtered Signal")
        plt.subplot(subplotLoc)
        subplotLoc += 1
        plt.title("Pre-processed Signal")
        plt.ylabel("Normalized Value")
        plt.xlabel("Time (ms)")
        plt.plot(inputTime, filteredValue)
        plt.ticklabel_format(style='sci', axis='x', scilimits=(0, 0))

        # ------------------------------------------------------------------
        # Prominence Finding
        # print("Processing - Prominence Finding")
        peaks, _ = signal.find_peaks(filteredValue)
        prominences = signal.peak_prominences(filteredValue, peaks)[0]

        # ------------------------------------------------------------------
        # AC Component Finding
        # print("Processing - AC Component Finding")
        promAveHalf = np.average(prominences) / 2
        acPoints = [peaks[i] for i, prominence in enumerate(prominences) if prominence > promAveHalf]
        acComponents = [prominence for prominence in prominences if prominence > promAveHalf]

        # ------------------------------------------------------------------
        # DC Component Finding
        # print("Processing - DC Component Finding")
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
        # print("Processing - AC - DC Component Matching")
        referencePoint = dcPoints[0]
        startTime = inputTime[referencePoint]
        endTime = startTime
        for t in inputTime[referencePoint:]:
            if startTime + 6000 <= endTime:
                break
            endTime = t

        # print("Processing - Get ac points after the first dc point on the left")

        # First dc point must be after the start time
        firstDc = dcPoints[0]
        for p in dcPoints:
            if inputTime[firstDc] >= startTime:
                break
            firstDc = p

        finalAcPoints, finalAcComponents = [], []
        if len(dcPoints) > 0:
            # Get indices of AC Points after the first DC Point
            acIndices = [i for i in range(len(acPoints)) if acPoints[i] > firstDc]
            finalAcPoints = [acPoints[i] for i in acIndices]
            finalAcComponents = [round(acComponents[i], 4) for i in acIndices]

        # print("Processing - Get dc points before the last ac point on the right")
        lastAc = finalAcPoints[-1]
        for p in reversed(acPoints):
            if inputTime[lastAc] < endTime:
                break
            lastAc = p

        finalDcPoints = []
        if len(finalAcPoints) > 1:
            finalDcPoints = [dcp for dcp in dcPoints if dcp < lastAc]

        # ------------------------------------------------------------------
        # Get AC and DC Component Time and Values
        # print("Processing - Get AC and DC Component Time and Values")
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
        # print("Plotting - AC Components")
        plt.subplot(subplotLoc)
        subplotLoc += 1
        plt.title("AC Components")
        plt.ylabel("Normalized Value")
        plt.xlabel("Time (ms)")
        plt.plot(inputTime, filteredValue)
        plt.plot(finalAcTimes, finalAcValues, 'x', color='g')
        plt.plot(finalAcTimes, finalAcMin, 'x', color='r')
        plt.vlines(x=finalAcTimes, ymin=finalAcMin, ymax=finalAcValues)
        plt.ticklabel_format(style='sci', axis='x', scilimits=(0, 0))
        plt.axvline(startTime, linestyle='--', color='green')
        plt.axvline(endTime, linestyle='--', color='green')

        # ------------------------------------------------------------------
        # Plot DC Components
        # print("Plotting - DC Components")
        plt.subplot(subplotLoc)
        subplotLoc += 1
        plt.title("DC Components")
        plt.ylabel("Normalized Value")
        plt.xlabel("Time (ms)")
        plt.plot(inputTime, filteredValue)
        plt.plot(finalDcTimes, finalDcComponents, 'x', color='r')
        plt.ticklabel_format(style='sci', axis='x', scilimits=(0, 0))
        plt.axvline(startTime, linestyle='--', color='green')
        plt.axvline(endTime, linestyle='--', color='green')
        plt.tight_layout()

        # ------------------------------------------------------------------
        # Saving Figure
        # TODO: Get figure filename from the config
        figureFilename = f"{pyResultsPath}/{figureNames[inputIndex]}.{figureType}"
        # print(f"Saving Figure - {figureFilename}")
        plt.tight_layout
        plt.savefig(figureFilename, format="svg", bbox_inches='tight')

    # ------------------------------------------------------------------
    # Component Properties
    # print(f"Properties - IR Components - {irComponents}")
    # print(f"Properties - Red Components - {redComponents}")

    # Get IR Ratio
    irAcAve = np.round(np.average(irComponents[AC]), 4)
    irDcAve = np.round(np.average(irComponents[DC]), 4)
    irRatio = np.round(irAcAve / irDcAve, 4)
    # print(f"Properties - IR Average - AC: {irAcAve}, DC: {irDcAve}, Ratio: {irRatio}")

    # Get Red Ratio
    redAcAve = np.round(np.average(redComponents[AC]), 4)
    redDcAve = np.round(np.average(redComponents[DC]), 4)
    redRatio = np.round(redAcAve / redDcAve, 4)
    # print(f"Properties - Red Average - AC: {redAcAve}, DC: {redDcAve}, Ratio: {redRatio}")

    # Get IR / Red Ratio
    irRedRatio = np.round(irRatio / redRatio, 4)
    # print(f"Properties - IR/Red Ratio: {irRedRatio}")

    # Print IR / Red Ratio as json
    ratio = {"ratio": str(irRedRatio)}
    print(json.dumps(ratio))


# print("\n##################################################\n")
exit()
