import sys
import json
import math
import numpy as np
import matplotlib.pyplot as plt
import scipy.signal as signal
from scipy.interpolate import interp1d

np.seterr(divide='ignore', invalid='ignore')
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
    # print("Py Process - BPARM - Node")
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
    # for key, val in config.items():
        # print(f"Config - {key}: {val}")

    # print("--------------------------------------------------")
    # Read input data
    ECG, PPG = 0, 1
    # print("Read - ECG")
    ecgPath = f"{rawDataPath}/{dataFiles[ECG]}"
    ecgCount, ecgTimes, ecgValues = readTimeValuePairs(ecgPath)
    # print(f"Read - ECG - Count: {ecgCount}")

    # print("Read - PPG")
    ppgPath = f"{rawDataPath}/{dataFiles[PPG]}"
    ppgCount, ppgTimes, ppgValues = readTimeValuePairs(ppgPath)
    # print(f"Read - PPG - Count: {ppgCount}")

    # print("--------------------------------------------------")
    # Interpolate signal
    interpolationMultiplier = duration * 100
    ecgInterpolationCount = math.ceil(ecgCount / interpolationMultiplier) * interpolationMultiplier
    ecgInterpolation = interp1d(ecgTimes, ecgValues)
    ecgTimes = np.linspace(ecgTimes[0], ecgTimes[-1], num=ecgInterpolationCount)
    ecgValues = ecgInterpolation(ecgTimes)
    # print(f"Interpolate - ECG Signal from {ecgCount} to {ecgInterpolationCount} Data Points")

    ppgInterpolationCount = math.ceil(ppgCount / interpolationMultiplier) * interpolationMultiplier
    ppgInterpolation = interp1d(ppgTimes, ppgValues)
    ppgTimes = np.linspace(ppgTimes[0], ppgTimes[-1], num=ppgInterpolationCount)
    ppgValues = ppgInterpolation(ppgTimes)
    # print(f"Interpolate - Red Signal from {ppgCount} to {ppgInterpolationCount} Data Points")

    # print("--------------------------------------------------")
    # Processing Blood Pressure
    # print(f"Processing - {title}")
    figures = []

    # Processing ECG
    subplotLoc = 311
    # print(f"Processing - ECG Input Signal")
    N = len(ecgValues)
    Fs = 100

    # ------------------------------------------------------------------
    # ECG Input Signal
    # print("Plotting - ECG Input Signal ")
    fig = newFigure()
    figures.append(fig)
    plt.subplot(311)
    plt.title("ECG Input Signal")
    plt.ylabel("ADC Value")
    plt.xlabel("Time (ms)")
    plt.plot(ecgTimes, ecgValues)
    plt.ticklabel_format(style='sci', axis='x', scilimits=(0, 0))
    # ------------------------------------------------------------------
    # ECG Signal Filtering
    # 10th order bandpass, 5 and 15 Hz cutoff frequencies
    # print(f"Processing - Bandpass Filter ECG Input Signal")
    ecgSos = signal.butter(10, [5, 15], 'bandpass', fs=Fs, output='sos')
    filteredEcgValues = np.round(signal.sosfiltfilt(ecgSos, ecgValues), 4)   # zero-phase

    # print(f"Processing - Squared Magnitude and Min Max Normalization")
    filteredEcgValues = np.sign(filteredEcgValues) * (filteredEcgValues ** 2)
    minEcgValue, maxEcgValue = np.min(filteredEcgValues), np.max(filteredEcgValues)
    filteredEcgValues = (filteredEcgValues - minEcgValue) / (maxEcgValue - minEcgValue)

    # print("Baseline Axis Translation")
    minFilteredEcgValues = np.min(filteredEcgValues)
    aveFilteredEcgValues = np.average(filteredEcgValues)
    filteredEcgValues = np.array([x - np.abs(minFilteredEcgValues - aveFilteredEcgValues) for x in filteredEcgValues])

    # Plot Pre-processed Signal
    # print("Plotting - Pre-processed ECG Signal")
    plt.subplot(312)
    plt.title("Pre-processed Signal")
    plt.ylabel("Normalized Value")
    plt.xlabel("Time (ms)")
    plt.plot(ecgTimes, filteredEcgValues)
    plt.ticklabel_format(style='sci', axis='x', scilimits=(0, 0))
    # ------------------------------------------------------------------
    # ECG Signal R-Peak Finding
    # print(f"Peak Finding - ECG R-Peaks")
    ecgThreshold = 0.05
    ecgPeaks, _ = signal.find_peaks(filteredEcgValues, height=ecgThreshold)

    ecgPeaksDiff = np.diff(ecgPeaks)
    ecgPeaksDiffAve = np.average(ecgPeaksDiff)
    ecgMultiplier = 0.666667
    ecgDistance = ecgPeaksDiffAve * ecgMultiplier
    ecgPeaks, _ = signal.find_peaks(filteredEcgValues, distance=ecgDistance, height=ecgThreshold)

    ecgPeaksTimes = ecgTimes[ecgPeaks]
    ecgPeaksValues = filteredEcgValues[ecgPeaks]

    # Plot ECG R-Peaks
    # print("Plotting - ECG R-Peaks")
    plt.subplot(313)
    plt.title("Initial ECG R-Peaks")
    plt.ylabel("Normalized Value")
    plt.xlabel("Time (ms)")
    plt.plot(ecgTimes, filteredEcgValues)
    plt.plot(ecgPeaksTimes, ecgPeaksValues, 'x', color='red')
    # plt.axhline(ecgThreshold, color='red', linestyle='dashed')
    plt.ticklabel_format(style='sci', axis='x', scilimits=(0, 0))
    # ------------------------------------------------------------------
    # Saving Figure
    figureFilename = f"{pyResultsPath}/{figureNames[0]}.{figureType}"
    # print(f"Saving Figure - {figureFilename}")
    plt.tight_layout()
    plt.savefig(figureFilename, format="svg", bbox_inches='tight')
    # ------------------------------------------------------------------
    # print("--------------------------------------------------")
    # Processing PPG
    # print("Processing - PPG Input Signal")
    Fs = 100

    # Plotting - PPG Input Signal
    # print("Plotting - PPG Input Signal")
    newFigure()
    plt.subplot(311)
    plt.title("PPG Input Signal")
    plt.ylabel("ADC Value")
    plt.xlabel("Time (ms)")
    plt.plot(ppgTimes, ppgValues)
    plt.ticklabel_format(style='sci', axis='x', scilimits=(0, 0))
    # ------------------------------------------------------------------
    # print("Processing - Filter and Normalize PPG Input Signal")
    ppgSos = signal.butter(10, 5, 'lowpass', fs=Fs, output='sos')
    filteredPpgValues = np.round(signal.sosfiltfilt(ppgSos, ppgValues), 4)   # zero-phase
    minPpgValue, maxPpgValue = np.min(filteredPpgValues), np.max(filteredPpgValues)
    filteredPpgValues = (filteredPpgValues - minPpgValue) / (maxPpgValue - minPpgValue)

    # print("Plotting - Pre-processed PPG Input Signal")
    plt.subplot(312)
    plt.title("Pre-processed Signal")
    plt.ylabel("Normalized Value")
    plt.xlabel("Time (ms)")
    plt.plot(ppgTimes, filteredPpgValues)
    plt.ticklabel_format(style='sci', axis='x', scilimits=(0, 0))
    # ------------------------------------------------------------------
    # print("Peak Finding - PPG Systolic Peaks")
    ppgPeaks, _ = signal.find_peaks(filteredPpgValues)
    ppgPeaksDiff = np.diff(ppgPeaks)
    ppgPeaksDiffAve = np.average(ppgPeaksDiff)
    systolicMultiplier = 0.75
    systolicDistance = ppgPeaksDiffAve * systolicMultiplier
    ppgSystolicPeaks, _ = signal.find_peaks(filteredPpgValues, distance=systolicDistance)
    ppgSystolicTimes = ppgTimes[ppgSystolicPeaks]
    ppgSystolicValues = filteredPpgValues[ppgSystolicPeaks]

    # print(f"Peak Finding - PPG Systolic Properties: Diff: {ppgPeaksDiff}, AveDiff: {ppgPeaksDiffAve}, Multiplier: {systolicMultiplier}, Distance: {systolicDistance}")
    # print("Plotting - PPG Systolic Peaks")
    plt.subplot(313)
    plt.title("Initial Systolic Peaks")
    plt.ylabel("Normalized Value")
    plt.xlabel("Time (ms)")
    plt.plot(ppgTimes, filteredPpgValues)
    plt.plot(ppgSystolicTimes, ppgSystolicValues, 'x', color='red')
    plt.ticklabel_format(style='sci', axis='x', scilimits=(0, 0))
    # ------------------------------------------------------------------
    # Saving Figure
    figureFilename = f"{pyResultsPath}/{figureNames[1]}.{figureType}"
    # print(f"Saving Figure - {figureFilename}")
    plt.tight_layout()
    plt.savefig(figureFilename, format="svg", bbox_inches='tight')
    # ------------------------------------------------------------------
    # print("--------------------------------------------------")
    # print("Processing - Derivative and Normalize of Filtered PPG Signal")

    ppgDerivativeValues = np.gradient(filteredPpgValues)
    minPpgDerivative, maxPpgDerivative = np.min(ppgDerivativeValues), np.max(ppgDerivativeValues)
    ppgDerivativeValues = (ppgDerivativeValues - minPpgDerivative) / (maxPpgDerivative - minPpgDerivative)

    # print("Plotting - Derivate of Filtered PPG Signal")
    newFigure()
    plt.subplot(311)
    plt.title('Filtered Signal and 1st Derivative')
    plt.ylabel("Normalized Value")
    plt.xlabel("Time (ms)")
    pltFiltered, = plt.plot(ppgTimes, filteredPpgValues, label="Filtered")
    pltDerivative, = plt.plot(ppgTimes, ppgDerivativeValues, color="g", linestyle="dashed", label="1st Derivative")
    plt.legend(handles=[pltFiltered, pltDerivative])
    plt.ticklabel_format(style='sci', axis='x', scilimits=(0, 0))
    # plt.axhline(0, color='gray', linestyle='dashed')
    # ------------------------------------------------------------------
    # print("Peak Finding - Filtered and Derivative Minimas")
    # print("Peak Finding - Filtered Flipped Vertical Signal Minima Finding")
    yFlipFilteredPpgValues = filteredPpgValues * -1
    yFlipFilteredPeaks, _ = signal.find_peaks(yFlipFilteredPpgValues)
    yFlipFilteredDiff = np.diff(yFlipFilteredPeaks)
    yFlipFilteredDiffAve = np.average(yFlipFilteredDiff)
    yFlipFilteredDistanceMultiplier = 0.8
    yFlipFilteredDistance = yFlipFilteredDiffAve * yFlipFilteredDistanceMultiplier
    yFlipFilteredPeaks, _ = signal.find_peaks(yFlipFilteredPpgValues, distance=yFlipFilteredDistance)
    yFlipFilteredTimes = ppgTimes[yFlipFilteredPeaks]
    yFlipFilteredValues = filteredPpgValues[yFlipFilteredPeaks]

    # print("Peak Finding - Derivative Flipped Vertical Signal Minima Finding")
    yFlipPpgDerivativeValues = ppgDerivativeValues * -1
    yFlipDerivativePeaks, _ = signal.find_peaks(yFlipPpgDerivativeValues)
    yFlipDerivativePeakTimes = ppgTimes[yFlipDerivativePeaks]

    # print("Plotting - Detected Filtered and First Derivative Minimas")
    plt.subplot(312)
    plt.title('Detected Filtered and First Derivative Minimas')
    plt.ylabel("Normalized Value")
    plt.xlabel("Time (ms)")
    plt.plot(ppgTimes, filteredPpgValues)
    plt.plot(ppgTimes, ppgDerivativeValues, color="g", linestyle="dashed")
    plt.plot(yFlipFilteredTimes, yFlipFilteredValues, 'x', color="r")
    plt.ticklabel_format(style='sci', axis='x', scilimits=(0, 0))
    plt.axhline(0, color='gray', linestyle='dashed')

    for t in yFlipDerivativePeakTimes:
        plt.axvline(t, color='r', linestyle='dashed')
    # ------------------------------------------------------------------
    # print("--------------------------------------------------")
    # print("Peak Finding - PPG Diastolic Peaks")
    # First Derivative Minima after each Filtered Minima
    ppgDiastolicPeaks = []
    for filteredMinima in yFlipFilteredPeaks:
        for derivativeMinima in yFlipDerivativePeaks:
            if derivativeMinima >= filteredMinima:
                ppgDiastolicPeaks.append(derivativeMinima)
                break

    ppgDiastolicTimes = ppgTimes[ppgDiastolicPeaks]
    ppgDiastolicValues = filteredPpgValues[ppgDiastolicPeaks]

    # print("Plotting - PPG Diastolic Peaks")
    plt.subplot(313)
    plt.title("Initial Diastolic Peaks")
    plt.ylabel("Normalized Value")
    plt.xlabel("Time (ms)")
    plt.plot(ppgTimes, filteredPpgValues)
    plt.ticklabel_format(style='sci', axis='x', scilimits=(0, 0))
    plt.plot(ppgDiastolicTimes, ppgDiastolicValues, 'x', color="r")
    # ------------------------------------------------------------------
    # Saving Figure
    figureFilename = f"{pyResultsPath}/{figureNames[2]}.{figureType}"
    # print(f"Saving Figure - {figureFilename}")
    plt.tight_layout()
    plt.savefig(figureFilename, format="svg", bbox_inches='tight')
    # ------------------------------------------------------------------
    # print("--------------------------------------------------")
    # print("Windowing - Determining 6 second strip window")
    referencePoint = yFlipFilteredPeaks[0]
    ecgStartTime = ecgTimes[referencePoint]
    ecgEndTime = ecgStartTime
    for t in ecgTimes[referencePoint:]:
        if ecgStartTime + 6000 <= ecgEndTime:
            break
        ecgEndTime = t

    ppgStartTime = ppgTimes[referencePoint]
    ppgEndTime = ppgStartTime
    for t in ppgTimes[referencePoint:]:
        if ppgStartTime + 6000 <= ppgEndTime:
            break
        ppgEndTime = t

    # print("Peak Matching - Get Points After Reference Point")
    finalEcgPeaks = [p for p in ecgPeaks if p >= referencePoint and ecgTimes[p] <= ecgEndTime]
    refSystolicPeaks = [p for p in ppgSystolicPeaks if p >= referencePoint and ppgTimes[p] <= ppgEndTime]
    refDiastolicPeaks = [p for p in ppgDiastolicPeaks if p >= referencePoint and ppgTimes[p] <= ppgEndTime]

    # print("Peak Matching - Get ECG and Systolic Points After First Diastolic Peak")
    finalSystolicPeaks = refSystolicPeaks
    if len(refDiastolicPeaks) > 0:
        firstDiastolicPeak = refDiastolicPeaks[0]
        finalSystolicPeaks = [
            p for p in finalSystolicPeaks if p >= firstDiastolicPeak]

    # print("Peak Matching - Get ECG and Diastolic Peaks Before Last Systolic Peak")
    finalDiastolicPeaks = refDiastolicPeaks
    if len(refSystolicPeaks) > 1:
        lastSystolicPeak = refSystolicPeaks[-1]
        finalDiastolicPeaks = [
            p for p in finalDiastolicPeaks if p <= lastSystolicPeak]

    finalEcgPeakTimes = ecgTimes[finalEcgPeaks]
    finalEcgPeakValues = filteredEcgValues[finalEcgPeaks]
    finalSystolicPeakTimes = ppgTimes[finalSystolicPeaks]
    finalSystolicPeakValues = filteredPpgValues[finalSystolicPeaks]
    finalDiastolicPeakTimes = ppgTimes[finalDiastolicPeaks]
    finalDiastolicPeakValues = filteredPpgValues[finalDiastolicPeaks]

    newFigure()
    # print("Plotting - Final ECG R-Peaks")
    plt.subplot(311)
    plt.title("Final ECG R-Peaks")
    plt.ylabel("Normalized Value")
    plt.xlabel("Time (ms)")
    plt.plot(ecgTimes, filteredEcgValues)
    plt.plot(finalEcgPeakTimes, finalEcgPeakValues, 'x', color='red')
    plt.ticklabel_format(style='sci', axis='x', scilimits=(0, 0))
    plt.axvline(ecgStartTime, linestyle='--', color='green')
    plt.axvline(ecgEndTime, linestyle='--', color='green')
    for t in finalEcgPeakTimes:
        plt.axvline(t, linestyle='--', color='gray')

    # print("Plotting - Final PPG Systolic Peaks")
    plt.subplot(312)
    plt.title("Final PPG Systolic Peaks")
    plt.ylabel("Normalized Value")
    plt.xlabel("Time (ms)")
    plt.plot(ppgTimes, filteredPpgValues)
    plt.plot(finalSystolicPeakTimes, finalSystolicPeakValues, 'x', color='red')
    plt.ticklabel_format(style='sci', axis='x', scilimits=(0, 0))
    plt.axvline(ppgStartTime, linestyle='--', color='green')
    plt.axvline(ppgEndTime, linestyle='--', color='green')
    for t in finalSystolicPeakTimes:
        plt.axvline(t, linestyle='--', color='gray')

    # print("Plotting - Final PPG Diastolic Peaks")
    plt.subplot(313)
    plt.title("Final PPG Diastolic Peaks")
    plt.ylabel("Normalized Value")
    plt.xlabel("Time (ms)")
    plt.plot(ppgTimes, filteredPpgValues)
    plt.plot(finalDiastolicPeakTimes, finalDiastolicPeakValues, 'x', color='red')
    plt.ticklabel_format(style='sci', axis='x', scilimits=(0, 0))
    plt.axvline(ppgStartTime, linestyle='--', color='green')
    plt.axvline(ppgEndTime, linestyle='--', color='green')
    for t in finalDiastolicPeakTimes:
        plt.axvline(t, linestyle='--', color='gray')

    plt.tight_layout()
    # ------------------------------------------------------------------
    # Saving Figure
    figureFilename = f"{pyResultsPath}/{figureNames[3]}.{figureType}"
    # print(f"Saving Figure - {figureFilename}")
    plt.tight_layout()
    plt.savefig(figureFilename, format="svg", bbox_inches='tight')

    # TODO: Compute these properties
    # heartRate - Ecg r-peak formula
    # ptt - Ecg r-peak - Ppg systolic peak times
    # rpdpt - Ecg r-peak - Ppg diastolic peak times
    # Print properties as json
    import random
    precision = 6
    heartRate = int(random.randrange(50, 100))
    ptt = np.round(random.random() * random.randrange(15, 35), precision)
    rpdpt = np.round(random.random() * random.randrange(15, 35), precision)

    properties = {
        "heartRate": str(heartRate),
        "ptt": str(ptt),
        "rpdpt": str(rpdpt)
    }
    print(json.dumps(properties))

# print("\n##################################################\n")
exit()
