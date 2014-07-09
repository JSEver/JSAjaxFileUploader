/*The MIT License (MIT)
Copyright (c) 2014 https://github.com/JSEver/JSAjaxFileUploader/

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.*/

(function($,undefined){
 var defaults = {
	uploadUrl:null,	//URL to which file must be uploaded Ex: upload.php
	fileName:'file', //File name of the upload file 
    inputText:'Select Files...', //Text on file select button
    formData:{},		//Any extra data to be sent with each uploaded file
    autoSubmit:true,	//If set to true then uploads starts as soon as a file is selected
    uploadTest:'Start Upload',	//Text to be displayed on upload button
	allowExt: 'gif|jpg|jpeg|png|bmp|mp4|mp3|pdf|doc|docx|xsl|txt',	//File extension to be allowed for upload you can specify n number file types
	maxFileSize: 5242880,	//Restrict each file size, default 5 MB in Bytes
	beforesend:function(file){}, //function to be executed before each upload for more info please refer https://api.jquery.com/jQuery.ajax/
	always:function(file){}, //function to be executed always each upload for more info please refer https://api.jquery.com/jQuery.ajax/
	done:function(file,xhr){}, //function to be executed on each upload is done for more info please refer https://api.jquery.com/jQuery.ajax/
	fail:function(response){}, //function to be executed on each upload fails for more info please refer https://api.jquery.com/jQuery.ajax/
	progress:function(file,event){}, //function to be executed on each upload is in progress for more info please refer https://api.jquery.com/jQuery.ajax/
	complete:function(file,xhr){}, //function to be executed on each upload completes for more info please refer https://api.jquery.com/jQuery.ajax/
	success:function(response){}, //function to be executed on each upload ajax success for more info please refer https://api.jquery.com/jQuery.ajax/
	error:function(response){}, //function to be executed on each upload ajax error for more info please refer https://api.jquery.com/jQuery.ajax/
	showProgress: true,	//to show or hide progress bar
	syncUploads: false,	//if set to true all uploads will be syncronous
	closeAnimationSpeed:500, //animation speed to close the file information in milliseconds
	zoomPreview:true,	//Enable/Disable Image enlarge on mouse over
	zoomWidth:160,		//width of enlarged photo
	zoomHeight:170		//height of enlarged photo
 };
 var elementId=0;$.filePool = {};
 $.fn.JSAjaxFileUploader = function(options) {
	 var settings = $.extend( {}, defaults, options );
	 var JSAjaxFileUploader = this;
	 var form = ['<form method="post" class="JSUploadForm" enctype="multipart/form-data" action=',settings.url,'>',
				'<label class="JSFileChoos"><input type="file" multiple style="display:none"/>',settings.inputText,'</label>',(settings.autoSubmit ? '' : '<label class="JSFileCount"></label><a href="#" class="startJSuploadButton" >'+settings.uploadTest+'</a>'),'<ul class="JSpreveiw"></ul></form>'];
	 this.onChange = function(JSNode,files){
		for (var i = 0; i < files.length; i++){
			var file = files[i];
			var re = new RegExp('.('+settings.allowExt+')$', "i");
			var $JSView = $('form ul.JSpreveiw',JSNode);
			elementId++;
			var oprIcons = ['<span class="JSOprIcons"><img src="img/icons/stop.png" id="stop',elementId,'" title="Stop Upload"><img id="close',elementId,'" src="img/icons/delete.png" title="Close"></span>'];
			if(!(re.test(file.name))) {
				var errMsg = '<span class="JSnotAllowed">File Type Not Suppoted!</span>';
				$JSView.append(prepareLi(_icon(file),file,elementId,true,errMsg));
				_closeStopHandler(elementId,settings.closeAnimationSpeed);
				$.closeClicked(settings);
				continue;
			}else if(file.size > settings.maxFileSize){
				var errMsg = '<span class="JSnotAllowed">File size '+getFileSize(file.size)+' greater than '+getFileSize(settings.maxFileSize)+' Not Allowed!</span>';
				$JSView.append(prepareLi(_icon(file),file,elementId,true,errMsg));
				_closeStopHandler(elementId,settings.closeAnimationSpeed);
				$.closeClicked(settings);
				continue;
			}
			if(!!file.type.match(/image.*/)) $.JSRender(JSNode,file,settings,elementId,oprIcons);
			else{
				var li = $(prepareLi(_icon(file),file,elementId,true,''));
				$('form ul.JSpreveiw',JSNode).append(li);
				var data = {
					JSNode:JSNode,
					file:file,
					settings:settings,
					id:elementId
				};
				$.startUpload(JSNode,settings,data);
			}
		}
		if(settings.zoomPreview)
			$('form ul li table td img.JSThumbnail',this).JSEnlargeImage({zoomWidth:settings.zoomWidth,zoomHeight:settings.zoomHeight});
	 };
	return this.each(function(){
		var JSNode = $(this);
		JSNode.html(form.join(''));
		$.filePool[JSNode] = [];
		$.filePool[JSNode+'uploading'] = false;
		if(settings.autoSubmit)
			$('form input[type="file"]',JSNode).change(function(event){
				JSAjaxFileUploader.onChange(JSNode,event.originalEvent.target.files);
				$(this).val('');
			});
		else{
			var filesSelected=null;
			$('form input[type="file"]',JSNode).change(function(event){
				filesSelected = event.originalEvent.target.files;
				$('form label.JSFileCount',JSNode).html(filesSelected.length+' file(s) selected');
			});
			$('form .startJSuploadButton',JSNode).click(function(event){
				event.preventDefault();
				if(filesSelected == null || filesSelected == undefined || filesSelected.length <= 0){alert('No Files Selected'); return;}
				JSAjaxFileUploader.onChange(JSNode,filesSelected);
				$(this).val('');
			});
		}
	});
 };

 $.startUpload = function(JSNode,settings,data){
	 if(settings.syncUploads === true){
    	 if(!$.filePool[JSNode+'uploading']){ _upload(data); $.filePool[JSNode+'uploading'] = true;}
    	 else {$.filePool[JSNode].push(data);$.closeClicked(settings);}
    }
     else _upload(data);
 };
 $.closeClicked = function(settings){
	 $('.JSCloaseButton').off('click').on('click',function(){
		 $('#JSfileLi'+($(this).attr('index'))).slideUp(settings.closeAnimationSpeed);
	 });
 };
 $.JSRender = function(JSNode,file,settings,id,oprIcons) {
	 var img = document.createElement("img");
     var reader = new FileReader();
     reader.onloadend = function() {
         img.src = reader.result;
         $('#thimbImg'+id).attr('src',img.src);
     };
     reader.readAsDataURL(file);
     $('form ul.JSpreveiw',JSNode).append(prepareLi(img.src,file,id,true,''));
     $('form ul.JSpreveiw span#fileId'+(id)+'_spanPercent',JSNode).html('<p style="font-size:9px;margin:0px">Waiting...</p>');
     var data = {
        JSNode:JSNode,
     	file:file,
     	settings:settings,
     	id:id
     };
     $.startUpload(JSNode,settings,data);
 };
 
var JSEnlargeImageDefaults = {
	zoomWidth:'160',
	zoomHeight:'170'
};
$.fn.JSEnlargeImage = function(options) {
	 settings = $.extend( {}, JSEnlargeImageDefaults, options );
	 return this.each(function(){
		$(this).off('mouseover,mouseout');
		$(this).on('mouseover',function(e){
			var y = e.pageY < settings.zoomHeight ? settings.zoomHeight : e.pageY;
			var mouseX = e.pageX+20; 
			var mouseY = (y - $(window).scrollTop() - settings.zoomHeight);
			var pho = ['<div id="JSEnlargePhotoTarget" style="display:none;position:fixed;z-index: 9999;width:',settings.zoomWidth,'px;height:',settings.zoomHeight,'px;border: 5px solid rgba(189, 189, 189, 0.59);"><img src="',$(this).attr('src'),'" style="width: inherit;height: inherit;"></img></div>'];
			$(pho.join('')).insertAfter(this);
			$('#JSEnlargePhotoTarget').css({'top':mouseY,'left':mouseX}).fadeIn(200);
		}).on('mouseout',function(){$('#JSEnlargePhotoTarget').remove();});
	});
 };
 

function JSStartUpload(opt) {
 return $.ajax({
		url:opt.url,
		type:'POST',
		data: opt.formData,
		processData: false,  // tell jQuery not to process the data
		contentType: false,   // tell jQuery not to set contentType
		xhr: opt.progress,
		beforeSend : function (){if(isValidFunction(opt.beforesend)) opt.beforesend(opt.file);},
		success:function(response){if(isValidFunction(opt.onSuccess)) opt.onSuccess(response);},
		error:function(xhr,textStatus,errorThrown){if(isValidFunction(opt.onError)) opt.onError(xhr, textStatus, errorThrown);}
	 });
 };

 
function getFileSize(bytes){
	 if (typeof bytes !== 'number') return '';
     if (bytes >= 1000000000) return (bytes / 1000000000).toFixed(2) + ' GB';
     if (bytes >= 1000000) return (bytes / 1000000).toFixed(2) + ' MB';
     return (bytes / 1000).toFixed(2) + ' KB';
}


var _upload = function(param){
	var JSNode = param.JSNode,file = param.file,settings = param.settings,id = param.id;
	var formData = false;
	if(window.FormData) {
		formData = new FormData();
	}else alert('Sorry file upload not supported in this browser!');
	formData.append(settings.fileName, file,file.name);
	$.each(settings.formData,function(i,v){formData.append(i, v);});
	if(formData){
		var $sizeSpan = $('#fileId'+(id)+'_span',JSNode);
		var $percentSpan = $('#fileId'+(id)+'_spanPercent',JSNode);
		var $progressBar = $('#fileId'+(id),JSNode); 
		var $stop = $('img#stop'+id,JSNode); 
		var $close = $('img#close'+id,JSNode);
		var progress = function(){
		    var xhr = new window.XMLHttpRequest();
		    xhr.upload.addEventListener("progress", function(evt){
		      if(isValidFunction(settings.progress)) settings.progress(file,evt);
		      if (settings.showProgress && evt.lengthComputable) {
		        var percentComplete = ((evt.loaded / evt.total)*100).toFixed();
		        $sizeSpan.html(getFileSize(evt.loaded)+' / '+getFileSize(evt.total));
		        $progressBar.css('width',percentComplete+'%');
		        $percentSpan.html(percentComplete+'% ');
		        if(percentComplete >= 100){
		        	var $eml = $('form ul.JSpreveiw li#JSfileLi'+(id),JSNode); 
					$eml.slideUp(settings.closeAnimationSpeed,function(){$eml.remove();});
					_nextUpload(settings,JSNode);
		      }
		      }
		    }, false);
		    return xhr;
		  };
		var JSxhr = JSStartUpload({url:settings.uploadUrl,file:file,formData:formData,progress:progress,beforesend:settings.beforesend,onSuccess:settings.success,onError:settings.success});
		$stop.on('click',function(){
			_nextUpload(settings,JSNode);
			if(JSxhr && JSxhr.readystate != 4) JSxhr.abort();
			$stop.off('click');
			$progressBar.css('background-image','linear-gradient(rgb(255, 129, 129) 20%, rgb(199, 5, 5) 90%)');
			$percentSpan.append('Canceled...').css({'font-size':'12px',color:'red'});
			$stop.remove();
		});
		$close.off('click').on('click',function(){
			_nextUpload(settings,JSNode);
			if(JSxhr && JSxhr.readystate != 4) JSxhr.abort();
			var $eml = $('form ul.JSpreveiw li#JSfileLi'+(id),JSNode); 
			$eml.slideUp(settings.closeAnimationSpeed,function(){$eml.remove();});
		});
		if(isValidFunction(settings.always)) JSxhr.always(function(){settings.always(file);});
		if(isValidFunction(settings.complete)) JSxhr.complete(function(){settings.complete(file,JSxhr);});
		if(isValidFunction(settings.done)) JSxhr.done(function(){settings.done(file,JSxhr);});
		if(isValidFunction(settings.fail)) JSxhr.fail(function(){settings.fail(file,JSxhr);});
	}
};//end of upload
var _icon = function(file){
	var arr = file.name.split('.');
	var ext = arr[arr.length - 1].toLowerCase();
	switch(ext){
		case 'pdf':return 'img/icons/pdf.png';
		case 'doc':return 'img/icons/doc.png';
		case 'docx':return 'img/icons/docx.png';
		case 'xls':return 'img/icons/excel.png';
		case 'xlsx':return 'img/icons/excel.png';
		case 'xml':return 'img/icons/xml.png';
		case 'txt':return 'img/icons/txt.png';
		default: if(!!file.type.match(/audio.*/)) return 'img/icons/music.png';
				 if(!!file.type.match(/video.*/)) return 'img/icons/media.png';
				 return 'img/icons/unknown.png';
	}
};
function prepareLi(imgSrc,file,id,isUploading,errMsg){
	var li;
	if($(window).width() > 400){
		li = ['<li id="JSfileLi',id,'"><table style="width:100%"><tr><td rowspan=3 style="width: 60px;"><div style="width: 12px;text-align: center;"><img class="JSThumbnail" id="thimbImg',id,'" src="',imgSrc,'" width=50 height=50></div></td><td><span class="JSfilename">',_trimFileName(file.name,30),'</span><td>',
	          (isUploading ? ('<span class="JSOprIcons"><img src="img/icons/stop.png" id="stop'+id+'" title="Stop Upload">') : '' ),'<img class="JSCloaseButton" id="close',id,'" index="',id,'" src="img/icons/delete.png" title="Close"></span></td></tr>',//end of 1st Row
	          '<tr><td style="width:70%"><span class="JSpercent" id="fileId',id,'_spanPercent"></span>',errMsg,'</td><td><span class="JSsize" id="fileId',id,'_span"></span></td></tr>',//end of 2nd Row
	          '<tr><td colspan=2><div class="JSProgressBarParent"><div id="fileId',id,'" class="JSFileProgress"></div></div></td></tr></table></li>'];
	}else{//for Mobile devices change layout
		li = ['<li id="JSfileLi',id,'"><table style="width:100%"><tr><td><span class="JSfilename">',_trimFileName(file.name,20),'</span><td>',
		          (isUploading ? ('<span class="JSOprIcons"><img src="img/icons/stop.png" id="stop'+id+'" title="Stop Upload">') : '' ),'<img class="JSCloaseButton" id="close',id,'" index="',id,'" src="img/icons/delete.png" title="Close"></span></td></tr>',//end of 1st Row
		          '<tr><td colspan=2 style="width: 60px;"><div style="text-align: center;"><img class="JSThumbnail" id="thimbImg',id,'" src="',imgSrc,'" width=30 height=30></div></td></tr>',//end of 2nd row
		          '<tr><td><span class="JSpercent" id="fileId',id,'_spanPercent"></span>',errMsg,'</td>',//end of 3rd Row
		          '<td><span class="JSsize" style="font-size: 9px;" id="fileId',id,'_span"></span></td></tr>',//end of 4th Row
		          '<tr><td colspan=2><div class="JSProgressBarParent"><div id="fileId',id,'" class="JSFileProgress"></div></div></td></tr></table></li>'];
	}
	return li.join("");
}
var _closeStopHandler = function(id,closeAnimationSpeed){
	$('#close'+id).on('click',function(e){
		var $li = $('#JSfileLi'+id);
		$li.slideUp(closeAnimationSpeed,function(){$li.remove();});
	});
};
var _trimFileName = function(string,length){
	if(string.length > length)
   	 return string.substring(0, (length/2))+'...'+string.substr(string.length - (length/2));
   	return string;
};
var isValidFunction = function(fn){
	return (fn !== undefined && fn !== null && typeof fn === 'function');
};
var _nextUpload = function(settings,JSNode){
	if(settings.syncUploads === true && $.filePool[JSNode].length > 0)
		_upload($.filePool[JSNode].shift());
	else $.filePool[JSNode+'uploading'] = false;
};
})(jQuery);