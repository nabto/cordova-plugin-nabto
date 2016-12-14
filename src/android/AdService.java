package com.nabto.api;


import android.app.Activity;

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



public class AdService{
    private ImageView adImageView;
    private static Dialog dialog;
//    private Activity act;
//    private Context context;
    public AdService(){}//Activity actIn, Context conIn){
//        act = actIn;
//        context = conIn;
//    }
    
    public void showAd(final Activity act, final Context context){
        final int adTimeout = 3000;
        act.runOnUiThread(new Runnable() {
                public void run() {
                    int drawableId = 0;
                    String adRef = "";
                    if(act.getResources().getConfiguration().orientation == Configuration.ORIENTATION_LANDSCAPE){
                        adRef = "@drawable/ad_land";
                    }else{
                        adRef = "@drawable/ad";
                    }
                    drawableId = act.getResources().getIdentifier(adRef, "drawable", act.getClass().getPackage().getName());
                    if (drawableId == 0) {
                        drawableId = act.getResources().getIdentifier(adRef, "drawable", act.getPackageName());
                    }
                    // Get reference to display
                    Display display = act.getWindowManager().getDefaultDisplay();
                    //Context context = webView.getContext();

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

                    dialog.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                                                WindowManager.LayoutParams.FLAG_FULLSCREEN);
                    dialog.setContentView(adImageView);
                    dialog.setCancelable(false);
                    dialog.show();
                    final Handler handler = new Handler();
                    handler.postDelayed(new Runnable() {
                            public void run() {
                                removeAd(act,context);
                            }
                        }, adTimeout);

                }
            });
    }
    private void removeAd(final Activity act, final Context context) {
        act.runOnUiThread(new Runnable() {
                public void run() {
                    if (dialog != null && dialog.isShowing()) {
                        dialog.dismiss();
                        dialog = null;
                        adImageView = null;
                    }
                }
            });
    }
}
