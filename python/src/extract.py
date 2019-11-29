from numpy import reshape, asarray, transpose, array, linalg, abs, cov
from math import sqrt
from sklearn.externals import joblib
from operator import itemgetter
import io

def Lagrangian(sample):
    sample = asarray(sample)
    lag = list()
    for j in range(0, sample.shape[1]):
        norm = sqrt(sum(sample[:, j] ** 2))
        l = sample[:, j] / norm
        lag.append(l)

    return array(transpose(lag))


def doPCA_sample(sample, step):
    pca = None
    sample = asarray(sample)
    if sample.shape[0] == step:
        cov_mat = cov(transpose(sample))
        eig_vals, eig_vecs = linalg.eig(cov_mat)
        eig_pairs = [(abs(eig_vals[i]), eig_vecs[:, i]) for i in range(len(eig_vals))]
        eig_pairs.sort(key=itemgetter(0))
        eig_pairs.reverse()
        pr = eig_pairs[0]
        pca = pr[1]

    return array(pca)


def LagPCA(sample):
    # input is a sample with chosen columns depend on the model and row_number=step and output is the index
    step = 12
    sample = asarray(sample)
    lag = Lagrangian(sample)
    pca = doPCA_sample(lag, step)
    pca = asarray(pca)
    return pca.astype(float)


def doCluster(sample, modelData):
    with io.BytesIO(modelData) as fo:
        model = joblib.load(fo)
    sample_index = LagPCA(sample)
    sample_index = reshape(sample_index, (1, -1))
    label = model.predict(sample_index)
    
    return label.tolist()
