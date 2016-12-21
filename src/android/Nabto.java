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

//TAKEN FROM SPLASHSCREEN SOME MAY BE REMOVED

import android.app.Dialog;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.res.Configuration;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Handler;
import android.view.Display;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup.LayoutParams;
import android.view.WindowManager;
import android.view.animation.Animation;
import android.view.animation.AlphaAnimation;
import android.view.animation.DecelerateInterpolator;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.RelativeLayout;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;
import android.R;
import android.util.Log;

//END



// REMOVE WITH CORE IMPLEMENTATION
import java.lang.System;
// END

public class Nabto extends CordovaPlugin {
    private static final int AMP_ERROR_NOT_PREPARED = 101; 
    private static final int GRACEPERIOD = 15; // seconds
    private NabtoApi nabto = null;
    private Session session;
    private Tunnel tunnel;

    private boolean adShown = false;
    private long timerStart = 0;
    private AdService adService;
    private List<String> deviceCache;
    
    public Nabto() {
        deviceCache = new ArrayList<String>();
        adService = new AdService();
        //adService = new AdService(cordova.getActivity(), webView.getContext());
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
            openSession(args.getString(0), args.getString(1), callbackContext);
        }
        else if (action.equals("openSession")) {
            openSession(args.getString(0), args.getString(1), callbackContext);
        }
        else if (action.equals("createKeyPair")) {
            createKeyPair(args.getString(0), args.getString(1), callbackContext);
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
        // Nabto Tunnel API
        else if (action.equals("tunnelOpenTcp")) {
            tunnelOpenTcp(args.getString(0), args.getInt(1), callbackContext);
        }
        else if (action.equals("tunnelVersion")) {
            tunnelVersion(callbackContext);
        }
        else if (action.equals("tunnelState")) {
            tunnelState(callbackContext);
        }
        else if (action.equals("tunnelLastError")) {
            tunnelLastError(callbackContext);
        }
        else if (action.equals("tunnelPort")) {
            tunnelPort(callbackContext);
        }
        else if (action.equals("tunnelClose")) {
            tunnelClose(callbackContext);
        }
        else {
            return false;
        }
        return true;
    }

    /* Nabto API */
    /*
    private ImageView adImageView;
    private static Dialog dialog;
    private void showAd() {
        final int adTimeout = 3000;
        cordova.getActivity().runOnUiThread(new Runnable() {
                public void run() {
                    int drawableId = 0;
                    String adRef = "";
                    if(cordova.getActivity().getResources().getConfiguration().orientation == Configuration.ORIENTATION_LANDSCAPE){
                        adRef = "@drawable/ad_land";
                    }else{
                        adRef = "@drawable/ad";
                    }
                    //String adRef = "@drawable/ad";
                    drawableId = cordova.getActivity().getResources().getIdentifier(adRef, "drawable", cordova.getActivity().getClass().getPackage().getName());
                    if (drawableId == 0) {
                        drawableId = cordova.getActivity().getResources().getIdentifier(adRef, "drawable", cordova.getActivity().getPackageName());
                    }
                    //final int drawableId = drawableIdtmp;

                    // Get reference to display
                    Display display = cordova.getActivity().getWindowManager().getDefaultDisplay();
                    Context context = webView.getContext();

                    // Use an ImageView to render the image because of its flexible scaling options.
                    adImageView = new ImageView(context);
                    adImageView.setImageResource(drawableId);
                    LayoutParams layoutParams = new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT);
                    adImageView.setLayoutParams(layoutParams);
                    adImageView.setMinimumHeight(display.getHeight());
                    adImageView.setMinimumWidth(display.getWidth());
                    adImageView.setBackgroundColor(Color.BLACK);
                    adImageView.setScaleType(ImageView.ScaleType.CENTER_INSIDE);
                    // Show the dialog
                    dialog = new Dialog(context, android.R.style.Theme_Translucent_NoTitleBar);

                    //if ((cordova.getActivity().getWindow().getAttributes().flags & WindowManager.LayoutParams.FLAG_FULLSCREEN)
//                        == WindowManager.LayoutParams.FLAG_FULLSCREEN) {
                    dialog.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                                                WindowManager.LayoutParams.FLAG_FULLSCREEN);
                    //}
                    dialog.setContentView(adImageView);
                    dialog.setCancelable(false);
                    dialog.show();
                    final Handler handler = new Handler();
                    handler.postDelayed(new Runnable() {
                            public void run() {
                                removeAd();
                            }
                        }, adTimeout);

                }
            });
    }

    private void removeAd() {
        cordova.getActivity().runOnUiThread(new Runnable() {
                public void run() {
                    if (dialog != null && dialog.isShowing()) {
                        dialog.dismiss();
                        dialog = null;
                        adImageView = null;
                    }
                }
            });
    }*/

    private void prepareInvoke(final JSONArray jsonDevices, final CallbackContext cc) {
        cordova.getThreadPool().execute(new Runnable(){
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
                        String[] bits = dev.split("\\.");
                        bits = bits[1].split("-");
                        if (bits[bits.length-1].equals("f")){
                            Log.d("prepareInvoke","found free device: " + dev);
                            showAdFlag = true;
                        } else if (bits[bits.length-1].equals("o")){
                            Log.d("prepareInvoke","found Own-it device: " + dev);
                        } else {
                            // device not on AMP, will never grant access
                            Log.d("prepareInvoke","found non-AMP device: " + dev);
                            continue;
                        }
                        if(!deviceCache.contains(dev)){
                            deviceCache.add(dev);
                        }
                    }
        
                    if (timerStart != 0){
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

    private void openSession(final String user, final String pass, final CallbackContext cc) {
        final Context context = cordova.getActivity().getApplicationContext();
        cordova.getThreadPool().execute(new Runnable() {
            @Override
            public void run() {
                if (nabto == null){
                    nabto = new NabtoApi(context);
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
                }
                else {
                    cc.success();
                }
            }
        });
    }


    private void startup(final CallbackContext cc) {
        final Context context = cordova.getActivity().getApplicationContext();

        cordova.getThreadPool().execute(new Runnable() {
            @Override
            public void run() {
                if(nabto!=null){
                    return;
                }
                nabto = new NabtoApi(context);

                NabtoStatus status = nabto.setStaticResourceDir();
                if (status != NabtoStatus.OK) {
                    cc.error(status.ordinal());
                    return;
                }

                nabto.startup();
                cc.success();
            }
        });
    }
    private void startupAndOpenProfile(final String user, final String pass, final CallbackContext cc) {
        final Context context = cordova.getActivity().getApplicationContext();

        cordova.getThreadPool().execute(new Runnable() {
            @Override
            public void run() {
                if (nabto != null) {
                    openSession(user, pass, cc);
                    return;
                }
                nabto = new NabtoApi(context);

                NabtoStatus status = nabto.setStaticResourceDir();
                if (status != NabtoStatus.OK) {
                    cc.error(status.ordinal());
                    return;
                }

                nabto.startup();
                openSession(user, pass, cc);
                cc.success();
            }
        });
    }

    private void createKeyPair(final String user, final String pass, final CallbackContext cc) {
        cordova.getThreadPool().execute(new Runnable(){
            @Override
            public void run() {
                NabtoStatus status = nabto.createSelfSignedProfile(user, pass);
                if (status != NabtoStatus.OK) {
                    cc.error(status.ordinal());
                    return;
                }
                cc.success();
            }
        });
            
    }

    private void shutdown(final CallbackContext cc) {
        cordova.getThreadPool().execute(new Runnable() {
            @Override
            public void run() {
                nabto.shutdown();
                nabto = null;
                session = null;
                deviceCache.clear();
                adShown = false;
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
                        error.put("event",AMP_ERROR_NOT_PREPARED);
                        error.put("header","Unprepared device invoked");
                        error.put("detail","AMP_ERROR_NOT_PREPARED");
                        error.put("body","rpcInvoke was called with uprepared device: " + dev + ". prepareInvoke must becalled before device can be invoked");
                        root.put("error",error);
                    } catch (JSONException e){
                        Log.e("rpcInvoke","could not put JSON error message");
                        return;
                    }
                    //Log.w("rpcInvoke","root: " + root.toString());
                    cc.error(root.toString());
                    return;
                }
                RpcResult result = nabto.rpcInvoke(url, session);
                if (result.getStatus() != NabtoStatus.OK) {
                    if(result.getStatus() == NabtoStatus.FAILED_WITH_JSON_MESSAGE){
                        /*try{
                            Log.w("rpcInvoke","result.getJson: " + result.getJson().toString());
                        } catch (NullPointerException e){
                            Log.w("rpcInvoke","result.getJson: NullPointerException");
                            }*/
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
                if (session == null){
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
                String token = nabto.getSessionToken(session);
                cc.success(token);
            }
        });
    }

    private void getLocalDevices(final CallbackContext cc) {
        cordova.getThreadPool().execute(new Runnable() {
            @Override
            public void run() {
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
                String version = nabto.version();
                cc.success(version);
            }
        });
    }

    /* Nabto Tunnel API */

    private void tunnelOpenTcp(String host, int port, CallbackContext cc) {
        if (tunnel != null) {
            cc.error(NabtoStatus.INVALID_TUNNEL.ordinal());
            return;
        }
        tunnel = nabto.tunnelOpenTcp(0, host, "localhost", port, session);
        NabtoStatus status = tunnel.getStatus();
        if (status != NabtoStatus.OK) {
            tunnel = null;
            cc.error(status.ordinal());
        }
        else {
            cc.success();
        }
    }

    private void tunnelVersion(CallbackContext cc) {
        if (tunnel == null) {
            cc.success(-1);
            return;
        }
        // Not returned by Android library wrapper
        cc.success(1);
    }

    private void tunnelState(CallbackContext cc) {
        if (tunnel == null) {
            cc.success(-1);
            return;
        }
        TunnelInfoResult info = nabto.tunnelInfo(tunnel);
        cc.success(info.getTunnelState().ordinal() - 1);
    }

    private void tunnelLastError(CallbackContext cc) {
        if (tunnel == null) {
            cc.success(-1);
            return;
        }
        TunnelInfoResult info = nabto.tunnelInfo(tunnel);
        cc.success(info.getStatus().ordinal() - 1);
    }

    private void tunnelPort(CallbackContext cc) {
        if (tunnel == null) {
            cc.success(-1);
            return;
        }
        TunnelInfoResult info = nabto.tunnelInfo(tunnel);
        cc.success(info.getPort());
    }

    private void tunnelClose(CallbackContext cc) {
        if (tunnel == null) {
            cc.error(NabtoStatus.INVALID_TUNNEL.ordinal());
            return;
        }
        NabtoStatus status = nabto.tunnelClose(tunnel);
        tunnel = null;
        if (status != NabtoStatus.OK) {
            cc.error(status.ordinal());
        }
        else {
            cc.success();
        }
    }
}
