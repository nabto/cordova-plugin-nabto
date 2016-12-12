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
    private static final int GRACEPERIOD = 15; // seconds
    private NabtoApi nabto = null;
    private Session session;
    private Tunnel tunnel;

    private boolean showAdFlag = true;
    private long timerStart = 0;
    
    private List<String> deviceCache;
    
    public Nabto() {
        deviceCache = new ArrayList<String>();
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
            startup(args.getString(0), args.getString(1), callbackContext);
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
        else if (action.equals("adShown")) {
            adShown(callbackContext);
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
    private ImageView splashImageView;
    private static Dialog splashDialog;
    private int orientation;
    private static boolean lastHideAfterDelay;
    private void showAd() {
        cordova.getActivity().runOnUiThread(new Runnable() {
                public void run() {
                    int drawableIdtmp = 0;
                    String splashResource = "@drawable/ad"; //preferences.getString("SplashScreen", "ad");//"SplashScreen";
                    drawableIdtmp = cordova.getActivity().getResources().getIdentifier(splashResource, "drawable", cordova.getActivity().getClass().getPackage().getName());
                    if (drawableIdtmp == 0) {
                        drawableIdtmp = cordova.getActivity().getResources().getIdentifier(splashResource, "drawable", cordova.getActivity().getPackageName());
                    }
                    final int drawableId = drawableIdtmp;
                    final int splashscreenTime = 3000;
                    final int fadeSplashScreenDuration = 500;
                    final int effectiveSplashDuration = Math.max(0, splashscreenTime - fadeSplashScreenDuration);
                    lastHideAfterDelay = true;

                    cordova.getActivity().runOnUiThread(new Runnable() {
                            public void run() {
                                // Get reference to display
                                Display display = cordova.getActivity().getWindowManager().getDefaultDisplay();
                                Context context = webView.getContext();

                                // Use an ImageView to render the image because of its flexible scaling options.
                                splashImageView = new ImageView(context);
                                splashImageView.setImageResource(drawableId);
                                LayoutParams layoutParams = new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT);
                                splashImageView.setLayoutParams(layoutParams);

                                splashImageView.setMinimumHeight(display.getHeight());
                                splashImageView.setMinimumWidth(display.getWidth());

                                // TODO: Use the background color of the webView's parent instead of using the preference.
                                splashImageView.setBackgroundColor(Color.BLACK);
                                splashImageView.setScaleType(ImageView.ScaleType.FIT_XY);
                                // Create and show the dialog
                                splashDialog = new Dialog(context, android.R.style.Theme_Translucent_NoTitleBar);
                                // check to see if the splash screen should be full screen
                                if ((cordova.getActivity().getWindow().getAttributes().flags & WindowManager.LayoutParams.FLAG_FULLSCREEN)
                                    == WindowManager.LayoutParams.FLAG_FULLSCREEN) {
                                    splashDialog.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                                                                      WindowManager.LayoutParams.FLAG_FULLSCREEN);
                                }
                                splashDialog.setContentView(splashImageView);
                                splashDialog.setCancelable(false);
                                splashDialog.show();
                                final Handler handler = new Handler();
                                handler.postDelayed(new Runnable() {
                                        public void run() {
                                            if (lastHideAfterDelay) {
                                                removeSplashScreen(false);
                                            }
                                        }
                                    }, effectiveSplashDuration);

                            }
                        });
                }
            });

                    
    }

       private void removeSplashScreen(final boolean forceHideImmediately) {
        cordova.getActivity().runOnUiThread(new Runnable() {
            public void run() {
                if (splashDialog != null && splashDialog.isShowing()) {
                    final int fadeSplashScreenDuration = 500;
                    // CB-10692 If the plugin is being paused/destroyed, skip the fading and hide it immediately
                    if (fadeSplashScreenDuration > 0 && forceHideImmediately == false) {
                        AlphaAnimation fadeOut = new AlphaAnimation(1, 0);
                        fadeOut.setInterpolator(new DecelerateInterpolator());
                        fadeOut.setDuration(fadeSplashScreenDuration);

                        splashImageView.setAnimation(fadeOut);
                        splashImageView.startAnimation(fadeOut);

                        fadeOut.setAnimationListener(new Animation.AnimationListener() {
                            @Override
                            public void onAnimationStart(Animation animation) {
                            }
                            @Override
                            public void onAnimationEnd(Animation animation) {
                                if (splashDialog != null && splashDialog.isShowing()) {
                                    splashDialog.dismiss();
                                    splashDialog = null;
                                    splashImageView = null;
                                }
                            }

                            @Override
                            public void onAnimationRepeat(Animation animation) {
                            }
                        });
                    } else {
                        splashDialog.dismiss();
                        splashDialog = null;
                        splashImageView = null;
                    }
                }
            }
        });
    }

    private void adShown(CallbackContext cc){
        // call to the core stating an ad was shown to the user
        
        cc.success();
    }

    private void prepareInvoke(JSONArray jsonDevices, CallbackContext cc) {
        // call to the core asking if invoke is prepared
        String dev;
        for (int i = 0; i< jsonDevices.length(); i++){
            try{
                Log.d("Nabto.java, prepareInvoke","jsonDevices[" + i + "]: " + jsonDevices.get(i).toString());
                //JSONObject dev2 = (JSONObject)jsonDevices.get(i);
                dev = jsonDevices.get(i).toString();// dev2.toString();
            } catch (JSONException e){
                Log.d("Nabto.java(269)","Failed to get jsonDevice, should not happen");
                continue;
            }
            // Log.d("prepareInvoke","dev from jsonDevices: " + dev);
            String[] bits = dev.split("\\.");
            // Log.d("prepareInvoke","bits.length: " + bits.length);
            // for (int k = 0; k < bits.length; k++){
            //     Log.d("prepareInvoke","bits[" + k + "]: " + bits[k]);
            // }
            bits = bits[1].split("-");
            if (bits[bits.length-1].equals("f")){
                Log.d("prepareInvoke","found free device");
                showAdFlag = true;
            }
            deviceCache.add(dev);
        }
        
        if (timerStart != 0){
            if (System.currentTimeMillis()-timerStart < GRACEPERIOD*1000){
                showAdFlag = false;
            } 
       }
        if(jsonDevices.length() > 0 && showAdFlag == true){
            this.showAd();
        }
        cc.success();
        timerStart = System.currentTimeMillis();
        showAdFlag = false;
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


    private void startup(final String user, final String pass, final CallbackContext cc) {
        final Context context = cordova.getActivity().getApplicationContext();

        cordova.getThreadPool().execute(new Runnable() {
            @Override
            public void run() {
                // if (nabto != null) {
                //     openSession(user, pass, cc);
                //     return;
                // }
                if(nabto!=null){
                    return;
                }
                nabto = new NabtoApi(context);

                NabtoStatus status = nabto.setStaticResourceDir();
                if (status != NabtoStatus.OK) {
                    cc.error(status.ordinal());
                    return;
                }

//                nabto.init(user, pass);
                nabto.startup();
                // openSession(user, pass, cc);
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
                showAdFlag = false;
                nabto.shutdown();
                nabto = null;
                session = null;
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

                String dev = url.split("/")[2];
                Log.d("rpcInvoke","dev from URL: " + dev);
                boolean devKnown = false;
                for (int i = 0; i < deviceCache.size(); i ++){
                    Log.d("rpcInvoke","checking: " + deviceCache.get(i));
                    if(deviceCache.get(i).equals(dev)){
                        devKnown = true;
                        break;
                    }
                }

                if(!devKnown){
                    cc.error("You are not prepared");
                    return;
                }
                
                RpcResult result = nabto.rpcInvoke(url, session);
                if (result.getStatus() != NabtoStatus.OK) {
                    cc.error(result.getStatus().ordinal());
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
