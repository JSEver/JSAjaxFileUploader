JSAjaxFileUploader
==================

JSAjaxFileUploader is a jQuery Plugin with ease of use. Just Download the  plugin include it in your project and thats it you are all set to use it.

Features:

1. Plug And Play Setup

2. Upload With Preview

3. Upload With Progress Bar

4. Responsive Layout

2. Multiple File Upload Support

3. Larger Files Upload

4. Fully Customizable

5. Lite weight (7.3 KB minified version)

6. Enlarge Images on mouse over

7. Optimized For Mobile Use

8. Can Be Used In Mobile Apps

9. Can Be Used With Phonegap/Cordova Apps

10. More over Absolutly FREE and much more…

API Details

	uploadUrl:null,	//URL to which file must be uploaded Ex: upload.php
	fileName:'file', //File name of the uploade file 
    	inputText:'Select Files...', //Text on file select button
    	formData:{},		//Any extra data to be sent with each uploaded file
	allowExt: 'gif|jpg|jpeg|png|bmp|mp4|mp3|pdf|doc|docx|xcl|txt',	//File extension to be allowed for upload you can specify n number file types
	maxFileSize: 5242880,	//Restric each file size, default 5 MB in Bytes
	beforesend:function(file){}, //function to be executed before each upload for more info please refer https://api.jquery.com/jQuery.ajax/
	always:function(file){}, //function to be executed always each upload for more info please refer https://api.jquery.com/jQuery.ajax/
	done:function(file,xhr){}, //function to be executed on each upload is done for more info please refer https://api.jquery.com/jQuery.ajax/
	fail:function(response){}, //function to be executed on each upload fails for more info please refer https://api.jquery.com/jQuery.ajax/
	progress:function(file,event){}, //function to be executed on each upload is in progress for more info please refer https://api.jquery.com/jQuery.ajax/
	complete:function(file,xhr){}, //function to be executed on each upload completes for more info please refer https://api.jquery.com/jQuery.ajax/
	success:function(response){}, //function to be executed on each upload ajax success for more info please refer https://api.jquery.com/jQuery.ajax/
	error:function(response){}, //function to be executed on each upload ajax error for more info please refer https://api.jquery.com/jQuery.ajax/
	showProgress: true,	//to show or hide progressbar
	closeAnimationSpeed:500, //animation speed to close the file information in mili seconds
	zoomPreview:true,	//Enable/Disable Image enlarge on mouse over
	zoomWidth:160,		//width of enlarged photo
	zoomHeight:170		//height of enlarged photo
