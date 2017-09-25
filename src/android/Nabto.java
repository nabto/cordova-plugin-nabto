/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 */

package com.nabto.api;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;
import android.content.Context;
import java.io.UnsupportedEncodingException;
import java.util.Arrays;
import java.util.Collection;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;
import android.R;
import android.util.Log;

public class Nabto extends CordovaPlugin {
    private static final int NABTO_ERROR_MISSING_PREPARE = 2000068; 
    private static final int GRACEPERIOD = 300; // seconds
    private NabtoApi nabto = null;
    private Session session;
    private Map<String, Tunnel> tunnels;

    private boolean adShown = false;
    private long timerStart = 0;
    private AdService adService;
    private List<String> deviceCache;
    
    public Nabto() {
        deviceCache = new ArrayList<String>();
        adService = new AdService();
        tunnels = new HashMap<String, Tunnel>();
    }

    /**
     * Executes the request and returns PluginResult.
     *
     * @param action            The action to execute.
     * @param args              JSONArray of arguments for the plugin.
     * @param callbackContext   The callback context used when calling back into JavaScript.
     * @return                  True when the action was valid, false otherwise.
     */
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        // Nabto API
        if (action.equals("startup")) {
            startup(callbackContext);
        }
        else if (action.equals("startupAndOpenProfile")) {
            startupAndOpenProfile(args.getString(0), args.getString(1), callbackContext);
        }
        else if (action.equals("setOption")) {
            setOption(args.getString(0), args.getString(1), callbackContext);
        }
        else if (action.equals("setBasestationAuthJson")) {
            setBasestationAuthJson(args.getString(0), callbackContext);
        }
        else if (action.equals("setStaticResourceDir")) {
            setStaticResourceDir(args.getString(0), callbackContext);
        }
        else if (action.equals("createSignedKeyPair")) {
            createSignedKeyPair(args.getString(0), args.getString(1), callbackContext);
        }
        else if (action.equals("createKeyPair")) {
            createKeyPair(args.getString(0), args.getString(1), callbackContext);
        }
        else if (action.equals("removeKeyPair")) {
            removeKeyPair(args.getString(0), callbackContext);
        }
        else if (action.equals("getFingerprint")) {
            getFingerprint(args.getString(0), callbackContext);
        }
        else if (action.equals("shutdown")) {
            shutdown(callbackContext);
        }
        else if (action.equals("prepareInvoke")) {
            prepareInvoke(args.getJSONArray(0),callbackContext);
        }
        else if (action.equals("fetchUrl")) {
            fetchUrl(args.getString(0), callbackContext);
        }
        else if (action.equals("rpcInvoke")) {
            rpcInvoke(args.getString(0), callbackContext);
        }
        else if (action.equals("rpcSetDefaultInterface")) {
            rpcSetDefaultInterface(args.getString(0), callbackContext);
        }
        else if (action.equals("rpcSetInterface")) {
            rpcSetInterface(args.getString(0),args.getString(1), callbackContext);
        }
        else if (action.equals("getSessionToken")) {
            getSessionToken(callbackContext);
        }
        else if (action.equals("getLocalDevices")) {
            getLocalDevices(callbackContext);
        }
        else if (action.equals("version")) {
            version(callbackContext);
        }
        else if (action.equals("versionString")) {
            versionString(callbackContext);
        }
        // Nabto Tunnel API
        else if (action.equals("tunnelOpenTcp")) {
            tunnelOpenTcp(args.getString(0), args.getInt(1), callbackContext);
        }
        else if (action.equals("tunnelVersion")) {
            tunnelVersion(args.getString(0), callbackContext);
        }
        else if (action.equals("tunnelState")) {
            tunnelState(args.getString(0), callbackContext);
        }
        else if (action.equals("tunnelLastError")) {
            tunnelLastError(args.getString(0), callbackContext);
        }
        else if (action.equals("tunnelPort")) {
            tunnelPort(args.getString(0), callbackContext);
        }
        else if (action.equals("tunnelClose")) {
            tunnelClose(args.getString(0), callbackContext);
        }
        else {
            return false;
        }
        return true;
    }

    /* Nabto API */
    private void prepareInvoke(final JSONArray jsonDevices, final CallbackContext cc) {
        cordova.getThreadPool().execute(new Runnable() {
                @Override
                public void run() {
                    // call to the core asking if invoke is prepared
                    boolean showAdFlag = false;
                    String dev;
                    if(jsonDevices.length() < 1){
                        cc.success();
                        Log.d("prepareInvoke", "prepareInvoke was called with empty device list");
                        return;
                    }
                    
                    for (int i = 0; i< jsonDevices.length(); i++){
                        try{
                            //Log.d("prepareInvoke","jsonDevices[" + i + "]: " + jsonDevices.get(i).toString());
                            dev = jsonDevices.get(i).toString();// dev2.toString();
                        } catch (JSONException e){
                            Log.w("prepareInvoke","Nabto.java: Failed to get jsonDevice, bad JSON syntax, skipping device");
                            continue;
                        }
            
                        // Checking if free, own-it or not AMP. We should agree how to define free and own-it in url
                        if (dev.matches("^[\\w]+\\.[\\w]{5}f(\\.[\\w]+)*$")){
                            Log.d("prepareInvoke","found free device: " + dev);
                            showAdFlag = true;
                        } else {
                            Log.d("prepareInvoke","found non-free device: " + dev);
                        }
                        if(!deviceCache.contains(dev)){
                            deviceCache.add(dev);
                        }
                    }
        
                    if (timerStart != 0) {
                        // an ad has been shown earlier - if within graceperiod, do not show again
                        if (System.currentTimeMillis()-timerStart < GRACEPERIOD*1000){
                            Log.d("prepareInvoke","Invoking grace period");
                            adShown = true;
                        } 
                    }
                    if(showAdFlag == true && adShown == false){
                        adService.showAd(cordova.getActivity(), webView.getContext());
                        timerStart = System.currentTimeMillis();
                        adShown = true;
                    } else {
                        //Log.d("prepareInvoke","Not showing ad, showAdFlag: " + showAdFlag + " adShown: " + adShown);
                    }
                    cc.success();
                }
            });
    }

    private void startup(final CallbackContext cc) {
        Log.d("startup", "Nabto startup begins");
        final Context context = cordova.getActivity().getApplicationContext();
        cordova.getThreadPool().execute(new Runnable() {
            @Override
            public void run() {
                if (nabto != null) {
                    Log.d("startup", "Nabto was already started");
                    cc.success();
                    return;
                }
                nabto = new NabtoApi(new NabtoAndroidAssetManager(context));
                nabto.startup();
                Log.d("startup", "Nabto started");
                cc.success();
            }
        });
    }
    private void startupAndOpenProfile(final String user, final String pass, final CallbackContext cc) {
        Log.d("startupAndOpenProfile", "Nabto startupAndOpenProfile begins");
        final Context context = cordova.getActivity().getApplicationContext();

        cordova.getThreadPool().execute(new Runnable() {
            @Override
            public void run() {
                if (nabto == null){
                    nabto = new NabtoApi(new NabtoAndroidAssetManager(context));
                }
                NabtoStatus status = nabto.startup();
                if (status != NabtoStatus.OK) {
                    cc.error(status.ordinal());
                    return;
                }

                if (session != null) {
                    cc.success();
                    return;
                }

                session = nabto.openSession(user, pass);

                if (session.getStatus() != NabtoStatus.OK) {
                    cc.error(session.getStatus().ordinal());
                    session = null;
                } else {
                    cc.success();
                }
            }
        });
    }

    private void createSignedKeyPair(final String user, final String pass, final CallbackContext cc) {
        cordova.getThreadPool().execute(new Runnable(){
            @Override
            public void run() {
                if (nabto == null) {
                    cc.error(NabtoStatus.API_NOT_INITIALIZED.ordinal());
                    return;
                }
                NabtoStatus status = nabto.createProfile(user, pass);
                if (status != NabtoStatus.OK) {
                    cc.error(status.ordinal());
                    return;
                }
                cc.success();
            }
        });
    }

    private void createKeyPair(final String user, final String pass, final CallbackContext cc) {
        cordova.getThreadPool().execute(new Runnable(){
            @Override
            public void run() {
                if (nabto == null) {
                    cc.error(NabtoStatus.API_NOT_INITIALIZED.ordinal());
                    return;
                }
                NabtoStatus status = nabto.createSelfSignedProfile(user, pass);
                if (status != NabtoStatus.OK) {
                    cc.error(status.ordinal());
                    return;
                }
                cc.success();
            }
        });
            
    }

    private void removeKeyPair(final String user, final CallbackContext cc) {
        cordova.getThreadPool().execute(new Runnable(){
            @Override
            public void run() {
                if (nabto == null) {
                    cc.error(NabtoStatus.API_NOT_INITIALIZED.ordinal());
                    return;
                }
                NabtoStatus status = nabto.removeProfile(user);
                if (status != NabtoStatus.OK) {
                    cc.error(status.ordinal());
                    return;
                }
                cc.success();
            }
        });
            
    }

    private void getFingerprint(final String certId, final CallbackContext cc){
        cordova.getThreadPool().execute(new Runnable() {
                @Override
                public void run(){
                    if (nabto == null) {
                        cc.error(NabtoStatus.API_NOT_INITIALIZED.ordinal());
                        return;
                    }
                    String[] fingerprint = new String[1];
                    fingerprint[0] = "";
                    NabtoStatus status = nabto.getFingerprint(certId,fingerprint);
                    if (status != NabtoStatus.OK) {
                        cc.error(status.ordinal());
                        return;
                    }
                    cc.success(fingerprint[0]);
                }
            });
    }
    
    private void shutdown(final CallbackContext cc) {
        cordova.getThreadPool().execute(new Runnable() {
            @Override
            public void run() {
                if(nabto != null){
                    nabto.shutdown();
                }
                nabto = null;
                session = null;
                deviceCache.clear();
                adShown = false;
                cc.success();
            }
        });
    }
    
    private void setBasestationAuthJson(final String authJson, final CallbackContext cc) {
        final Context context = cordova.getActivity().getApplicationContext();
        cordova.getThreadPool().execute(new Runnable() {
                @Override
                public void run() {
                    if (session == null) {
                        cc.error(NabtoStatus.API_NOT_INITIALIZED.ordinal());
                        return;
                    }
                    String json;
                    if (authJson.length() > 0) {
                        json = authJson;
                    } else {
                        // we interpret javascript empty string as user's intention of resetting auth data
                        json = null;
                    }
                    NabtoStatus status = nabto.setBasestationAuthJson(json, session);
                    if (status != NabtoStatus.OK) {
                        cc.error(status.ordinal());
                        return;
                    }
                    cc.success();
                }
            });
            
    }

    private void setStaticResourceDir(final String dir, final CallbackContext cc) {
        final Context context = cordova.getActivity().getApplicationContext();
        cordova.getThreadPool().execute(new Runnable() {
                @Override
                public void run() {
                    if (nabto == null) {
                        cc.error(NabtoStatus.API_NOT_INITIALIZED.ordinal());
                        return;
                    }
                    NabtoStatus status = nabto.setStaticResourceDir(dir);
                    if (status != NabtoStatus.OK) {
                        cc.error(status.ordinal());
                        return;
                    }
                    cc.success();
                }
            });
            
    }

    private void fetchUrl(final String url, final CallbackContext cc) {
        cordova.getThreadPool().execute(new Runnable() {
            @Override
            public void run() {
                if (session == null) {
                    cc.error(NabtoStatus.API_NOT_INITIALIZED.ordinal());
                    return;
                }
                UrlResult result = nabto.fetchUrl(url, session);
                if (result.getStatus() != NabtoStatus.OK) {
                    cc.error(result.getStatus().ordinal());
                    return;
                }

                try {
                    String stringResult = new String(result.getResult(), "UTF-8");
                    cc.success(stringResult);
                } catch (UnsupportedEncodingException e) {
                    cc.error("Nabto request parse error");
                }
            }
        });
    }

    private void rpcInvoke(final String url, final CallbackContext cc) {
        cordova.getThreadPool().execute(new Runnable() {
            @Override
            public void run() {
                if (session == null) {
                    cc.error(NabtoStatus.API_NOT_INITIALIZED.ordinal());
                    return;
                }

                // looking up the device in the Cache.
                String dev = url.split("/")[2];
                //Log.d("rpcInvoke","dev from URL: " + dev);
                boolean devKnown = false;
                for (int i = 0; i < deviceCache.size(); i ++){
                    //Log.d("rpcInvoke","checking: " + deviceCache.get(i));
                    if(deviceCache.get(i).equals(dev)){
                        devKnown = true;
                        break;
                    }
                }
                // If the device is unknown rpcInvoke fails
                if(!devKnown){
                    JSONObject error = new JSONObject();
                    JSONObject root = new JSONObject();
                    try{
                        error.put("event",NABTO_ERROR_MISSING_PREPARE);
                        error.put("header","Unprepared device invoked");
                        error.put("detail", dev);
                        error.put("body","rpcInvoke was called with unprepared device: " + dev + ". prepareInvoke must be called before device can be invoked");
                        root.put("error",error);
                    } catch (JSONException e){
                        Log.e("rpcInvoke","could not put JSON error message");
                        cc.error(NabtoStatus.FAILED.ordinal());
                        return;
                    }
                    //Log.w("rpcInvoke","root: " + root.toString());
                    cc.error(root.toString());
                    return;
                }
                RpcResult result = nabto.rpcInvoke(url, session);
                if (result.getStatus() != NabtoStatus.OK) {
                    if(result.getStatus() == NabtoStatus.FAILED_WITH_JSON_MESSAGE){
                        cc.error(result.getJson());
                    } else {
                        cc.error(result.getStatus().ordinal());
                    }
                    return;
                }

                String stringResult = new String(result.getJson());
                cc.success(stringResult);
            }
        });
    }

    private void rpcSetDefaultInterface(final String interfaceXml, final CallbackContext cc){
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                if (session == null){
                    cc.error(NabtoStatus.API_NOT_INITIALIZED.ordinal());
                    return;
                }
                RpcResult result = nabto.rpcSetDefaultInterface(interfaceXml, session);
                if(result.getStatus() == NabtoStatus.API_NOT_INITIALIZED){
                    cc.error(NabtoStatus.API_NOT_INITIALIZED.ordinal());
                    return;
                }
                cc.success();
            }
        });
                    
    }

    private void rpcSetInterface(final String host, final String interfaceXml, final CallbackContext cc){
        cordova.getThreadPool().execute(new Runnable(){
            public void run() {
                if (session == null) {
                    cc.error(NabtoStatus.API_NOT_INITIALIZED.ordinal());
                    return;
                }
                RpcResult result = nabto.rpcSetInterface(host,interfaceXml, session);
                if(result.getStatus() == NabtoStatus.API_NOT_INITIALIZED){
                    cc.error(NabtoStatus.API_NOT_INITIALIZED.ordinal());
                    return;
                }
                cc.success();
            }
        });
                
    }
    
    private void getSessionToken(final CallbackContext cc) {
        cordova.getThreadPool().execute(new Runnable() {
            @Override
            public void run() {
                if (nabto == null) {
                    cc.error(NabtoStatus.API_NOT_INITIALIZED.ordinal());
                    return;
                }
                String token = nabto.getSessionToken(session);
                cc.success(token);
            }
        });
    }

    private void getLocalDevices(final CallbackContext cc) {
        cordova.getThreadPool().execute(new Runnable() {
            @Override
            public void run() {
                if (nabto == null) {
                    cc.error(NabtoStatus.API_NOT_INITIALIZED.ordinal());
                    return;
                }
                Collection<String> devices = nabto.getLocalDevices();
                JSONArray jsonArray = new JSONArray(devices); //Arrays.asList(devices));
                cc.success(jsonArray);
            }
        });
    }

    private void version(final CallbackContext cc) {
        cordova.getThreadPool().execute(new Runnable() {
            @Override
            public void run() {
                if (nabto == null) {
                    cc.error(NabtoStatus.API_NOT_INITIALIZED.ordinal());
                    return;
                }
                String version = nabto.version();
                cc.success(version);
            }
        });
    }

    private void versionString(final CallbackContext cc) {
        cordova.getThreadPool().execute(new Runnable() {
            @Override
            public void run() {
                if (nabto == null) {
                    cc.error(NabtoStatus.API_NOT_INITIALIZED.ordinal());
                    return;
                }
                String version = nabto.versionString();
                cc.success(version);
            }
        });
    }

    private void setOption(final String key, final String value, final CallbackContext cc) {
        cordova.getThreadPool().execute(new Runnable() {
            @Override
            public void run() {
                if (nabto == null) {
                    cc.error(NabtoStatus.API_NOT_INITIALIZED.ordinal());
                    return;
                }
                NabtoStatus status = nabto.setOption(key, value);
                if (status == NabtoStatus.OK) {
                    cc.success();
                } else {
                    cc.error(status.ordinal());
                    return;
                }
            }
        });
    }


    /* Nabto Tunnel API */

    private void tunnelOpenTcp(final String host, final int port, final CallbackContext cc) {
        cordova.getThreadPool().execute(new Runnable() {
                @Override
                public void run() {
                    if (nabto == null) {
                        cc.error(NabtoStatus.API_NOT_INITIALIZED.ordinal());
                        return;
                    }
                    Tunnel tunnel = nabto.tunnelOpenTcp(0, host, "localhost", port, session);
                    NabtoStatus status = tunnel.getStatus();
                    if (status == NabtoStatus.OK) {
                        TunnelInfoResult info = nabto.tunnelInfo(tunnel);
                        while (info.getStatus() == NabtoStatus.OK &&
                               info.getTunnelState() == NabtoTunnelState.CONNECTING) {
                            try {
                                Thread.sleep(100);
                            } catch (InterruptedException e) {
                                // ignore
                            }
                            info = nabto.tunnelInfo(tunnel);
                        }
                        if (info.getStatus() == NabtoStatus.OK &&
                            info.getTunnelState() != NabtoTunnelState.CLOSED) {
                            String handle = tunnel.getHandle().toString();
                            tunnels.put(handle, tunnel);
                            cc.success(handle);
                        } else {
                            if (info.getStatus() == NabtoStatus.OK) {
                                // TODO: json error message instead (currently not possible for caller to
                                // determine domain (api or p2p error))
                                cc.error(NabtoStatus.INVALID_TUNNEL.ordinal());
                            } else {
                                cc.error(info.getStatus().ordinal());
                            }
                        }
                    } else {
                        cc.error(status.ordinal());
                    }
                }
            });
    }

    private void tunnelVersion(final String tunnelHandle, final CallbackContext cc) {
        cordova.getThreadPool().execute(new Runnable() {
                @Override
                public void run() {
                    if (nabto == null) {
                        cc.error(NabtoStatus.API_NOT_INITIALIZED.ordinal());
                        return;
                    }
                    Tunnel tunnel = tunnels.get(tunnelHandle);
                    if (tunnel != null) {
                        TunnelInfoResult info = nabto.tunnelInfo(tunnel);
                        if (info.getStatus() == NabtoStatus.OK) {
                            cc.success(info.getVersion());
                        } else {
                            cc.error(NabtoStatus.FAILED.ordinal());
                        }
                    } else {
                        cc.error(NabtoStatus.INVALID_TUNNEL.ordinal());
                    }
                }
            });
    }

    private void tunnelState(final String tunnelHandle, final CallbackContext cc) {
        cordova.getThreadPool().execute(new Runnable() {
                @Override
                public void run() {
                    if (nabto == null) {
                        cc.error(NabtoStatus.API_NOT_INITIALIZED.ordinal());
                        return;
                    }
                    Tunnel tunnel = tunnels.get(tunnelHandle);
                    if (tunnel != null) {
                        TunnelInfoResult info = nabto.tunnelInfo(tunnel);
                        if (info.getStatus() == NabtoStatus.OK) {
                            cc.success(info.getTunnelState().ordinal());
                        } else {
                            cc.error(NabtoStatus.FAILED.ordinal());
                        }
                    } else {
                        cc.error(NabtoStatus.INVALID_TUNNEL.ordinal());
                    }
                }
            });
    }
    
    private void tunnelLastError(final String tunnelHandle, final CallbackContext cc) {
        cordova.getThreadPool().execute(new Runnable() {
                @Override
                public void run() {
                    if (nabto == null) {
                        cc.error(NabtoStatus.API_NOT_INITIALIZED.ordinal());
                        return;
                    }
                    Tunnel tunnel = tunnels.get(tunnelHandle);
                    if (tunnel != null) {
                        TunnelInfoResult info = nabto.tunnelInfo(tunnel);
                        if (info.getStatus() == NabtoStatus.OK) {
                            cc.success(info.getLastError());
                        } else {
                            cc.error(NabtoStatus.FAILED.ordinal());
                        }
                    } else {
                        cc.error(NabtoStatus.INVALID_TUNNEL.ordinal());
                    }
                }
            });
    }

    private void tunnelPort(final String tunnelHandle, final CallbackContext cc) {
        cordova.getThreadPool().execute(new Runnable() {
                @Override
                public void run() {
                    if (nabto == null) {
                        cc.error(NabtoStatus.API_NOT_INITIALIZED.ordinal());
                        return;
                    }
                    Tunnel tunnel = tunnels.get(tunnelHandle);
                    if (tunnel != null) {
                        TunnelInfoResult info = nabto.tunnelInfo(tunnel);
                        if (info.getStatus() == NabtoStatus.OK) {
                            cc.success(info.getPort());
                        } else {
                            cc.error(NabtoStatus.FAILED.ordinal());
                        }
                    } else {
                        cc.error(NabtoStatus.INVALID_TUNNEL.ordinal());
                    }
                }
            });
    }

    private void tunnelClose(final String tunnelHandle, final CallbackContext cc) {
        cordova.getThreadPool().execute(new Runnable() {
                @Override
                public void run() {
                    if (nabto == null) {
                        cc.error(NabtoStatus.API_NOT_INITIALIZED.ordinal());
                        return;
                    }
                    Tunnel tunnel = tunnels.get(tunnelHandle);
                    if (tunnel != null) {
                        NabtoStatus status = nabto.tunnelClose(tunnel);
                        if (status == NabtoStatus.OK) {
                            tunnels.remove(tunnel);
                            cc.success();
                        } else {
                            cc.error(status.ordinal());
                        }
                    } else {
                        cc.error(NabtoStatus.INVALID_TUNNEL.ordinal());
                        return;
                    }
                }
            });
    }
}
