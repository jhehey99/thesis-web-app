import sys
import json
import numpy as np
import matplotlib.pyplot as plt
import scipy.signal as signal


print("mama mo")

if len(sys.argv) > 1:
    print(sys.argv)
    print(np.array([1, 2, 3]))
    config = json.loads(sys.argv[1]).items()
    print(config)

else:
    print(np.array([1, 2, 3]))


print("x")

exit()
