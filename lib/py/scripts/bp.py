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


def readTimeValuePairs(filePath, skip=0):
    # print(f"Read - Path: {filePath}")
    f = open(filePath)
    count, times, values = 0, [], []

    for line in f:
        if count < skip:
            count += 1
            continue
        t, v = [int(x) for x in line.strip().split(',')]
        times.append(t)
        values.append(v)
        count += 1

    count -= skip
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
    ecgCount, ecgTimes, ecgValues = readTimeValuePairs(ecgPath, skip=100)
    # print(f"Read - ECG - Count: {ecgCount}")

    # print("Read - PPG")
    ppgPath = f"{rawDataPath}/{dataFiles[PPG]}"
    ppgCount, ppgTimes, ppgValues = readTimeValuePairs(ppgPath, skip=100)
    # print(f"Read - PPG - Count: {ppgCount}")

    # print("--------------------------------------------------")
    # Interpolate signal
    interpolationMultiplier = duration * 100
    ecgInterpolationCount = math.ceil(ecgCount / interpolationMultiplier) * interpolationMultiplier
    ecgInterpolation = interp1d(ecgTimes, ecgValues)
    ecgTimes = np.linspace(ecgTimes[0], ecgTimes[-1], num=ecgInterpolationCount)
    ecgValues = ecgInterpolation(ecgTimes)

    # convert nans to number next to it
    for i in range(len(ecgValues) - 1):
        if np.isnan(ecgValues[i]):
            ecgValues[i] = ecgValues[i + 1]

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
    filteredEcgValues = np.round(signal.sosfiltfilt(ecgSos, ecgValues), 4)  # zero-phase

    # print(f"Processing - Squared Magnitude and Min Max Normalization")
    filteredEcgValues = np.sign(filteredEcgValues) * (filteredEcgValues ** 2)
    minEcgValue, maxEcgValue = np.min(filteredEcgValues), np.max(filteredEcgValues)
    filteredEcgValues = (filteredEcgValues - minEcgValue) / (maxEcgValue - minEcgValue)
    # print(filteredEcgValues)

    # print("Baseline Axis Translation")
    minFilteredEcgValues = np.min(filteredEcgValues)
    aveFilteredEcgValues = np.average(filteredEcgValues)
    filteredEcgValues = np.array([x - np.abs(minFilteredEcgValues - aveFilteredEcgValues) for x in filteredEcgValues])
    # print(filteredEcgValues)

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
    ecgThreshold = 0.10  # 0.05
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
    filteredPpgValues = np.round(signal.sosfiltfilt(ppgSos, ppgValues), 4)  # zero-phase
    unnormalizedValues = filteredPpgValues

    # Normalization
    minPpgValue, maxPpgValue = np.min(filteredPpgValues), np.max(filteredPpgValues)
    filteredPpgValues = (filteredPpgValues - minPpgValue) / (maxPpgValue - minPpgValue)

    from scipy import sparse
    from scipy.sparse.linalg import spsolve

    # Baseline Correction with Assymetric Squares used to make minimas more prominent to accurately find minimas
    def baseline_als(y, lam, p, niter=10):
        s = len(y)
        D0 = sparse.eye(s)
        d1 = [np.ones(s - 1) * -2]
        D1 = sparse.diags(d1, [-1])
        d2 = [np.ones(s - 2) * 1]
        D2 = sparse.diags(d2, [-2])
        D = D0 + D2 + D1
        w = np.ones(s)
        for i in range(niter):
            W = sparse.diags([w], [0])
            Z = W + lam * D.dot(D.transpose())
            z = spsolve(Z, w * y)
            w = p * (y > z) + (1 - p) * (y < z)

        return z

    baselineValues = baseline_als(filteredPpgValues, 300, 0.05)

    # ------------------------------------------------------------------
    # print("Peak Finding - Find Minima")
    # pagkakuha nung inverted peaks. i-peak finding ung peaks, to get the correct minimas
    invertedPpgValues = baselineValues * -1
    minimas, _ = signal.find_peaks(invertedPpgValues)

    # print("Plotting - Pre-processed PPG Input Signal")
    plt.subplot(312)
    plt.title("Pre-processed Signal w/ Minimas")
    plt.ylabel("Normalized Value")
    plt.xlabel("Time (ms)")

    plt.plot(ppgTimes, filteredPpgValues)
    plt.plot(ppgTimes[minimas], filteredPpgValues[minimas], 'x', color='magenta')

    # inverted
    plt.plot(ppgTimes, invertedPpgValues, color='green')
    plt.plot(ppgTimes[minimas], invertedPpgValues[minimas], 'x', color='red')
    plt.ticklabel_format(style='sci', axis='x', scilimits=(0, 0))

    # ------------------------------------------------------------------
    # print("Peak Finding - PPG Systolic Peaks")
    ppgPeaks, _ = signal.find_peaks(filteredPpgValues)
    ppgPeaksDiff = np.diff(ppgPeaks)
    ppgPeaksDiffAve = np.average(ppgPeaksDiff)
    systolicMultiplier = 0.75
    systolicDistance = ppgPeaksDiffAve * systolicMultiplier
    ppgSystolicPeaks, _ = signal.find_peaks(filteredPpgValues, distance=systolicDistance)

    # print("Peak Finding - Get Systolic Peaks before minima")
    initialSystolicPeaks = []

    for i, minima in enumerate(minimas):
        peaksBeforeMinima = [systolicPeak for systolicPeak in ppgSystolicPeaks if systolicPeak <= minima]
        if len(peaksBeforeMinima) <= 0:
            continue
        latestSystolicPeak = max(peaksBeforeMinima)
        initialSystolicPeaks.append(latestSystolicPeak)

    ppgSystolicPeaks = initialSystolicPeaks
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
    # TOTEST AND TODELETE
    # yFlipFilteredPpgValues = filteredPpgValues * -1
    # yFlipFilteredPeaks, _ = signal.find_peaks(yFlipFilteredPpgValues)
    # yFlipFilteredDiff = np.diff(yFlipFilteredPeaks)
    # yFlipFilteredDiffAve = np.average(yFlipFilteredDiff)
    # yFlipFilteredDistanceMultiplier = 0.8
    # yFlipFilteredDistance = yFlipFilteredDiffAve * yFlipFilteredDistanceMultiplier
    # yFlipFilteredPeaks, _ = signal.find_peaks(yFlipFilteredPpgValues, distance=yFlipFilteredDistance)
    # yFlipFilteredTimes = ppgTimes[yFlipFilteredPeaks]
    # yFlipFilteredValues = filteredPpgValues[yFlipFilteredPeaks]

    # TOTEST AND TODELETE ## TOUSE
    yFlipFilteredTimes = ppgTimes[minimas]
    yFlipFilteredValues = filteredPpgValues[minimas]

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
    for i in range(len(minimas) - 1):
        filteredMinima, nxtMinima = minimas[i], minimas[i + 1]
        derivativeMinimas = []
        for derivativeMinima in yFlipDerivativePeaks:
            if derivativeMinima >= filteredMinima and derivativeMinima < nxtMinima:
                derivativeMinimas.append((derivativeMinima, ppgDerivativeValues[derivativeMinima]))

        # print("MAMA MO NA NAMAN")
        # print(derivativeMinimas)
        if len(derivativeMinimas) >= 3:
            derivativeMinimas.pop()
        if len(derivativeMinimas) >= 2:
            derivativeMinimas.pop()
        ppgDiastolicPeaks.append(min(derivativeMinimas, key=lambda x: abs(x[1] - 0.5))[0])


    # print("Peak Removal - PPG Diastolic Peaks")
    # Get Diastolic Peak after each minima
    initialDiastolicPeaks = []

    # print("MAMA KO")
    # print(ppgDiastolicPeaks)

    for i in range(len(minimas) - 1):
        minima, nxt = minimas[i], minimas[i + 1]
        peaksBeforeMinima = [diastolicPeak for diastolicPeak in ppgDiastolicPeaks if diastolicPeak >= minima and diastolicPeak < nxt]
        # peaksBeforeMinima = [diastolicPeak for diastolicPeak in ppgDiastolicPeaks if diastolicPeak >= minima and diastolicPeak < nxt]
        if len(peaksBeforeMinima) <= 0:
            continue

        peakValsBeforeMinima = []
        for p in peaksBeforeMinima:
            peakValsBeforeMinima.append((p, filteredPpgValues[p]))

        # print("MAMA MO")
        # print(peakValsBeforeMinima)
        recentDiastolicPeak = min(peakValsBeforeMinima, key=lambda x: x[1])[0]
        # print(recentDiastolicPeak)
        # recentDiastolicPeak = min(peaksBeforeMinima)
        initialDiastolicPeaks.append(recentDiastolicPeak)

    ppgDiastolicPeaks = initialDiastolicPeaks
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
    # referencePoint = yFlipFilteredPeaks[0]
    referencePoint = minimas[0]
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
        finalSystolicPeaks = [p for p in finalSystolicPeaks if p >= firstDiastolicPeak]

        # Get diastolic peaks after the diastolic peak of first dia-sys pair
        for i in range(len(refDiastolicPeaks)):
            if len(finalSystolicPeaks) > 0 and refDiastolicPeaks[i] >= finalSystolicPeaks[0] and i - 1 >= 0:
                refDiastolicPeaks = refDiastolicPeaks[i - 1:]
                break

    # print("Peak Matching - Get ECG and Diastolic Peaks Before Last Systolic Peak")
    finalDiastolicPeaks = refDiastolicPeaks
    # TORECHECK
    if len(finalSystolicPeaks) > 1:
        lastSystolicPeak = finalSystolicPeaks[-1]
        finalDiastolicPeaks = [p for p in finalDiastolicPeaks if p <= lastSystolicPeak]

    # for i, minima in enumerate(minimas):
    #     peaksBeforeMinima = [systolicPeak for systolicPeak in ppgSystolicPeaks if systolicPeak <= minima]
    #     if len(peaksBeforeMinima) <= 0:
    #         continue
    #     latestSystolicPeak = max(peaksBeforeMinima)
    #     initialSystolicPeaks.append(latestSystolicPeak)

    peakMatches = []
    ecgMatch, sysMatch, diaMatch = [], [], []

    for i, ecgPeak in enumerate(finalEcgPeaks):
        # get nearest systolic peak to the right of an ecg peak
        sysPeaksAfterEcgPeak = [sysPeak for sysPeak in finalSystolicPeaks if sysPeak >= ecgPeak and sysPeak not in sysMatch]
        if len(sysPeaksAfterEcgPeak) <= 0:
            continue
        nearestSystolicPeak = min(sysPeaksAfterEcgPeak)
        # if nearestSystolicPeak in sysMatch:
            # continue

        # get nearest diastolic peak to the left of the nearest systolic peak
        diaPeaksBeforeEcgPeak = [diaPeak for diaPeak in finalDiastolicPeaks if diaPeak < nearestSystolicPeak and diaPeak not in diaMatch]
        if len(diaPeaksBeforeEcgPeak) <= 0:
            continue
        nearestDiastolicPeak = max(diaPeaksBeforeEcgPeak)
        # if nearestDiastolicPeak in diaMatch:
            # continue

        if nearestDiastolicPeak < nearestSystolicPeak:
            ecgMatch.append(ecgPeak)
            sysMatch.append(nearestSystolicPeak)
            diaMatch.append(nearestDiastolicPeak)
            # peakMatches.append((ecgPeak, nearestSystolicPeak, nearestDiastolicPeak))

    finalEcgPeakTimes = ecgTimes[ecgMatch]
    finalEcgPeakValues = filteredEcgValues[ecgMatch]
    finalSystolicPeakTimes = ppgTimes[sysMatch]
    finalSystolicPeakValues = filteredPpgValues[sysMatch]
    finalDiastolicPeakTimes = ppgTimes[diaMatch]
    finalDiastolicPeakValues = filteredPpgValues[diaMatch]

    # finalEcgPeakTimes = ecgTimes[finalEcgPeaks]
    # finalEcgPeakValues = filteredEcgValues[finalEcgPeaks]
    # finalSystolicPeakTimes = ppgTimes[finalSystolicPeaks]
    # finalSystolicPeakValues = filteredPpgValues[finalSystolicPeaks]
    # finalDiastolicPeakTimes = ppgTimes[finalDiastolicPeaks]
    # finalDiastolicPeakValues = filteredPpgValues[finalDiastolicPeaks]

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

    # ------------------------------------------------------------------
    # Computing Properties
    precision = 6
    lenEcg, lenSys, lenDia = len(finalEcgPeakTimes), len(finalSystolicPeakTimes), len(finalDiastolicPeakTimes)

    # Heart Rate = 60 / R - R Duration
    ecgRRDurations = np.array([finalEcgPeakTimes[i + 1] - finalEcgPeakTimes[i] for i in range(lenEcg - 1)])
    aveEcgRRDuration = np.average(ecgRRDurations) / 1000  # ms -> s
    heartRate = int(np.round(60 / aveEcgRRDuration))

    # ptt - Ecg R-Peak - Ppg Systolic peak times
    ptts = []
    for i in range(min(lenEcg, lenSys)):
        ecg, sys = finalEcgPeakTimes[i], finalSystolicPeakTimes[i]
        ptts.append(abs(sys - ecg))
    ptt = np.round(np.average(np.array(ptts)), precision)

    # rpdpt - Ecg R-Peak - Ppg Diastolic peak times
    rpdpts = []
    for i in range(min(lenEcg, lenDia)):
        ecg, dia = finalEcgPeakTimes[i], finalDiastolicPeakTimes[i]
        rpdpts.append(abs(dia - ecg))
    rpdpt = np.round(np.average(np.array(rpdpts)), precision)

    # Print properties as json
    properties = {
        "heartRate": str(heartRate),
        "ptt": str(ptt),
        "rpdpt": str(rpdpt)
    }
    print(json.dumps(properties))

# print("\n##################################################\n")
exit()
