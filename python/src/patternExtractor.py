import zerorpc
import tempfile
import os
import signal
import sys
from extract import doCluster

class PatternExtractor(object):
    def clusterize(self, model, samples):
        labels = []
        for index in range(len(samples) - 12 + 1):
            label = doCluster(samples[index:index+12], model)
            labels.append(label)

        return labels

    def startTraining(self, data):
        tempFile = tempfile.NamedTemporaryFile(suffix='.model')
        tempFile.close()

        #TODO train the model
        #TODO save the model into tempfile.name (async)

        return tempFile.name

    def getTrainedModel(self, modelFile):
        try:
            f = open(modelFile, 'rb')
            model = f.read()
            f.close()
            os.remove(modelFile)

            return model
        except FileNotFoundError:
            return None

def exit():
    server.stop()
    server.close()
    sys.exit(0)

zerorpc.gevent.signal(signal.SIGTERM, exit)
zerorpc.gevent.signal(signal.SIGINT, exit)

server = zerorpc.Server(PatternExtractor())
server.bind("tcp://0.0.0.0:4242")
server.run()
