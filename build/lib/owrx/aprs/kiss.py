import pickle
from pycsdr.types import Format
from csdr.module import ThreadModule
from owrx.kiss_frames import KissStreamDecoder, ax25_payloads


class KissDeframer(ThreadModule):
    def __init__(self):
        self.decoder = KissStreamDecoder()
        super().__init__()

    def getInputFormat(self) -> Format:
        return Format.CHAR

    def getOutputFormat(self) -> Format:
        return Format.CHAR

    def run(self):
        while self.doRun:
            data = self.reader.read()
            if data is None:
                self.doRun = False
            else:
                for frame in self.parse(data):
                    self.writer.write(pickle.dumps(frame))

    def parse(self, input):
        # PacketDemodulator feeds the next Ax25Parser stage, which expects raw
        # AX.25 bytes. Keep the richer port/command frames for Data2G adapters.
        yield from ax25_payloads(self.decoder, input)
