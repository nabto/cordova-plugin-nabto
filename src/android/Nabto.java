/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 */

package com.nabto.api;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import android.content.Context;

import java.io.UnsupportedEncodingException;
import java.util.Arrays;

public class Nabto extends CordovaPlugin {
    private NabtoApi nabto = null;
    private Session session;

    public Nabto() {}

    /**
     * Executes the request and returns PluginResult.
     *
     * @param action            The action to execute.
     * @param args              JSONArray of arguments for the plugin.
     * @param callbackContext   The callback context used when calling back into JavaScript.
     * @return                  True when the action was valid, false otherwise.
     */
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (action.equals("startup")) {
            startup(args.getString(0), args.getString(1), callbackContext);
        }
        else if (action.equals("shutdown")) {
            shutdown(callbackContext);
        }
        else if (action.equals("fetchUrl")) {
            fetchUrl(args.getString(0), callbackContext);
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
        else {
            return false;
        }
        return true;
    }

    private void openSession(String user, String pass, CallbackContext cc) {
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

    private void startup(final String user, final String pass, final CallbackContext cc) {
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

                nabto.init(user, pass);
                openSession(user, pass, cc);
            }
        });
    }

    private void shutdown(final CallbackContext cc) {
        cordova.getThreadPool().execute(new Runnable() {
            @Override
            public void run() {
                nabto.pause(session);
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

                UrlFetchResult result = nabto.fetchUrl(url, session);
                if (result.getNabtoStatus() != NabtoStatus.OK) {
                    cc.error(result.getNabtoStatus().ordinal());
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
                String[] devices = nabto.nabtoGetLocalDevices();
                JSONArray jsonArray = new JSONArray(Arrays.asList(devices));
                cc.success(jsonArray);
            }
        });
    }

    private void version(final CallbackContext cc) {
        cordova.getThreadPool().execute(new Runnable() {
            @Override
            public void run() {
                String version = nabto.nabtoVersion();
                cc.success(version);
            }
        });
    }
}
