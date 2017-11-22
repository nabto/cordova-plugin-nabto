package com.nabto.api;


import java.util.Arrays;


public class CordovaStream {
    private final int BUFFER_LENGTH = 10240;// 10KB buffer
    private Stream stream;
    private byte[] buffer;
    private int head = 0;
    private String handle;
    private NabtoApi nabto;

    public CordovaStream(NabtoApi api) {
        buffer = new byte[BUFFER_LENGTH];
        nabto = api;
    }

    public NabtoStatus open(final String host, Session session) {
        stream = nabto.streamOpen(host, session);
        if (stream.getStatus() == NabtoStatus.OK) {
            handle = stream.getHandle().toString();
            nabto.streamSetOption(stream, NabtoStreamOption.RECEIVE_TIMEOUT, -1);
        }
        return stream.getStatus();
    }
    
    public NabtoStatus close(){
        return nabto.streamClose(stream);
    }

    public StreamReadResult read(int bytes) {
        byte[] data = new byte[bytes];
        if (head == 0){
            StreamReadResult result = nabto.streamRead(stream);
            if(result.getStatus() == NabtoStatus.OK) {
                head = result.getData().length;
                buffer = Arrays.copyOf(result.getData(), head);
            } else {
                return result;
            }
        }
        if( head > 0 ) {
            if( bytes < head ) {
                data = Arrays.copyOf(buffer, bytes);
                buffer = Arrays.copyOfRange(buffer, bytes, head);
                head = head - bytes;
            } else {
                data = Arrays.copyOf(buffer, head);
                head = 0;
            }
            return new StreamReadResult(data, NabtoStatus.OK.ordinal());
        } else {
            return new StreamReadResult(null, NabtoStatus.FAILED.ordinal());
        }
    }

    public NabtoStatus write(final byte[] data) {
        return nabto.streamWrite(stream, data);        
    }

    public NabtoConnectionType connectionType() {
        return nabto.streamConnectionType(stream);
    }
    
    public String getHandle() {
        return handle;
    }
    
}
