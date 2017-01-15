var clonos={
	
	tmp_jail_info:{},
	manual_close_menu:false,
	lastX:0,
	
	start:function()
	{
		this.addEvents();
		
		var r, res, args=[];
		var hash=window.location.hash;
		hash=hash.replace(new RegExp(/^#/),'');
		var rx=new RegExp(/([^\/]+)/g);
		if(res=hash.match(rx))
		{
			for(r in res)
			{
				var r1=res[r].split('-');
				if(r1.length==2) args[args.length]={'var':r1[0],'val':r1[1]};
			}
			this.route(args);
		}
	},
	
	addEvents:function()
	{
		$('#lng-sel').bind('change',function(){document.cookie="lang="+$(this).val()+";path=/;";location.reload();});
		$('#content').bind('click',$.proxy(this.bodyClick,this));
		$('.closer').bind('click',$.proxy(this.closerClick,this));
		$(window).bind('keypress',$.proxy(this.dialogCloseByKey,this))
			.bind('resize',$.proxy(this.onResize,this));
		$('div.menu').bind("touchstart",$.proxy(this.onTouchStart,this))
			.bind("touchend",$.proxy(this.onTouchEnd,this));
		
		this.tasks.init(this);
	},
	
	onResize:function()
	{
		if(this.manual_close_menu) return;
		var wdt=$(window).width();
		if(wdt<800) $('body').addClass('gadget'); else $('body').removeClass('gadget');
	},
	closerClick:function(event)
	{
		$('body').toggleClass('gadget');
		this.manual_close_menu=true;
	},
	onTouchStart:function(event)
	{
		var target=event.target;
		
		if(typeof target.nodeName!='undefined')
		{
			if(target.nodeName!='DIV') return;
		}
		
		$('.closer').css({'backgroundColor':'silver'});
		setTimeout(function(){$('.closer').css({'backgroundColor':''})},100);
		
		var t=event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
		this.lastX=t.clientX;
		//event.stopPropagation();
		event.preventDefault();
	},
	onTouchEnd:function(event)
	{
		var target=event.target;
		if(typeof target.nodeName!='undefined')
		{
			var cl=target.className;
			if(typeof cl!='undefined' && cl=='menu') return;
		}
		
		if(typeof target.className!='undefined')
		{
			if(target.className=='closer')
			{
				$('body').toggleClass('gadget');
				this.manual_close_menu=true;
				return;
			}
		}
		
		if(target.nodeName!='DIV') return;

		var t=event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
		var curX=t.clientX;
		if(curX<this.lastX)
		{
			$('body').addClass('gadget');
			this.manual_close_menu=true;
		}else{
			$('body').removeClass('gadget');
			this.manual_close_menu=true;
		}
		//event.stopPropagation();
		event.preventDefault();
	},
	
	translate:function(phrase)
	{
		if(typeof this.lang!='undefined')
		{
			if(typeof this.lang[phrase]!='undefined')
				return this.lang[phrase];
		}
		return phrase;
	},
	
	route:function(args)
	{
		if(typeof args=='undefined') return;
		//alert(args.length);
	},
	
	getTrIdsForCheck:function(table_id)
	{
		var ids=[];
		var els=$('#'+table_id+' tr');
		if(els.length<1) return ids;
		for(n=0,nl=els.length;n<nl;n++)
		{
			var id=$(els[n]).attr('id');
			if(typeof id!='undefined') ids[n]=id;
		}
		return ids;
	},
	
	dialogOpen:function(event)
	{
		var tg=event.target;
		var cl=$(tg).attr('class');
		var res=new RegExp(/id:([^ ]+)/);
		if(res=cl.match(res))
		{
			var id=res[1];
			if(id=='jail-settings')
			{
				this.getFreeJname();	// Берём с сервера свободное имя клетки
				this.trids=this.getTrIdsForCheck('jailslist');
			}
			if(id=='bhyve-new')
			{
				this.trids=this.getTrIdsForCheck('bhyveslist');
			}
			this.dialogShow1(id);
		}
	},
	dialogShow:function(jname,type)
	{
		if(typeof jname=='undefined') return;
		$('#vnc-iframe').attr('src','/vnc.php?jname='+jname);
		
		this.dialogShow1('vnc',type);
		$('#vnc-iframe').get(0).focus();
		$('#vnc-iframe').bind('blur',function(){$('#vnc-iframe').get(0).focus();});
	},
	dialogShow1:function(id)
	{
		var dlg=$('dialog#'+id);
		
		if($('span.close-but',dlg).length==0)
			$('h1',dlg).before('<span class="close-but">×</span>');
		
		var wd=$(dlg).width();
		var hg=$(dlg).height();
		var mt=hg/2;
		var ml=wd/2;
		
		var res=$(dlg).get(0).showModal;
		if(typeof res=='function')
		{
			$('dialog#'+id).css('display','block').get(0).showModal();
			$('dialog#'+id).bind('close',$.proxy(this.dialogClose,this));
		}else{
			var bkg=$('div#backdrop').get(0);
			if(typeof bkg=='undefined')
			{
				$('dialog#'+id).before('<div id="backdrop"></div>');
			}
			$('dialog#'+id).css({
				'display':'block',
				'top':'50%',
				'margin-top':'-'+mt+'px',
				'left':'50%',
				'margin-left':'-'+ml+'px',
				'position':'fixed',
				'z-index':'100000',
			});
			$('div#backdrop').css('display','block');
		}
		$(dlg).find('input[type=text],textarea').filter(':visible:first').focus();
	},
	dialogClose:function()
	{
		var dialogs=$('dialog');
		for(var n=0,nl=dialogs.length;n<nl;n++)
		{
			var dialog=dialogs[n];
			if(typeof $(dialog).get(0).showModal=='function')
			{
				if($(dialog).attr('open')!='undefined' &&
					$(dialog).attr('open')=='open')
						$(dialog).get(0).close();
			}else{
				$('div#backdrop').css('display','none');
			}
			$(dialog).css('display','none');
			if($('form',dialog).length>0) $('form',dialog).get(0).reset();	// Очищаем форму, после нажатия на CANCEL
		}
	},
	dialogCloseByKey:function(event)
	{
		var target=event.target;
		if(target.nodeName=='INPUT')
		{
			target.setCustomValidity('');
			target.checkValidity();
		}
		
		if(window.showModal=='function') return;
		if(event.keyCode==27) this.dialogClose();
	},
	dialogSubmit:function(id)
	{
		var n,nl;
		var repDisplaying=false;
		if(typeof id=='undefined' || id=='') return;
		var inps=$('dialog#'+id+' input:invalid');
		if(inps.length>0)
		{
			for(n=0,nl=inps.length;n<nl;n++)
			{
				var inp=$(inps[n]).get(0);
				if(inp.validity.patternMismatch || inp.validity.valueMissing)
				{
					var elname=$(inp).attr('name');
					if(typeof err_messages=='object' && typeof err_messages[elname]!='undefined')
					{
						inp.setCustomValidity(err_messages[elname]);
					}else{
						inp.setCustomValidity('Error!');
					}
					if(!repDisplaying)
					{
						inp.reportValidity();
						repDisplaying=true;
					}
				}else{
					inp.setCustomValidity('');
				}
			}
		}else{
			if($('form#jailSettings').length>0)
			{
				var jid=$('form#jailSettings input[name="jname"]').val();
				if(this.trids.length>0)
				{
					if(this.trids.indexOf(jid)!=-1)
					{
						var inp=$('form#jailSettings input[name="jname"]').get(0);
						inp.setCustomValidity(this.translate('This name is already exists!'));
						inp.reportValidity();
						return;
					}
					var pass1=$('form#jailSettings input[name="user_pw_root"]').val();
					var pass2=$('form#jailSettings input[name="user_pw_root_1"]').val();
					if(pass1!='' || pass2!='' && pass1!=pass2)
					{
						var inp=$('form#jailSettings input[name="user_pw_root"]').get(0);
						inp.setCustomValidity(this.translate('Passwords must match!'));
						inp.reportValidity();
						return;
					}
				}
				this.tmp_jail_info[jid]={};
				this.tmp_jail_info[jid]['runasap']=$('#astart-id:checked').length>0?1:0;
				var posts=$('form#jailSettings').serializeArray();
				this.loadData('jailAdd',$.proxy(this.onJailAdd,this),posts);
			}
			if(id=='bhyve-new' && $('form#bhyveSettings').length>0)
			{
				var jid=$('form#bhyveSettings input[name="vm_name"]').val();
				if(typeof this.trids!='undefined' && this.trids.length>0)
				{
					if(this.trids.indexOf(jid)!=-1)
					{
						var inp=$('form#bhyveSettings input[name="vm_name"]').get(0);
						inp.setCustomValidity(this.translate('This name is already exists!'));
						inp.reportValidity();
						return;
					}
				}
				this.tmp_jail_info[jid]={};
				this.tmp_jail_info[jid]['runasap']=0;	// исправить на реальные данные!
				var posts=$('form#bhyveSettings').serializeArray();
				this.loadData('bhyveAdd',$.proxy(this.onJailAdd,this),posts);
			}
			if(id=='bhyve-obtain' && $('form#bhyveObtSettings').length>0)
			{
				var jid=$('form#bhyveObtSettings input[name="vm_name"]').val();
				this.tmp_jail_info[jid]={};
				this.tmp_jail_info[jid]['runasap']=0;	// исправить на реальные данные!
				var posts=$('form#bhyveObtSettings').serializeArray();
				this.loadData('bhyveObtain',$.proxy(this.onJailAdd,this),posts);
			}
			if(id=='authkey')
			{
				var posts=$('form#authkeySettings').serializeArray();
				this.loadData('authkeyAdd',$.proxy(this.onAuthkeyAdd,this),posts);
			}
			if(id=='vpnet')
			{
				var posts=$('form#vpnetSettings').serializeArray();
				this.loadData('vpnetAdd',$.proxy(this.onVpnetAdd,this),posts);
			}
			
		}
	},
	onJailAdd:function(data)
	{
		try{
			var data=$.parseJSON(data);
		}catch(e){alert(e.message);return;}
		
		if(typeof data!='undefined' && !data.error)
		{
			if(typeof data.mode!='undefined')
			{
				switch(data.mode)
				{
					case 'jailAdd':
						var table='jailslist';
						var operation='jcreate';
						break;
					case 'bhyveAdd':
						var table='bhyveslist';
						var operation='bcreate';
						break;
					case 'bhyveObtain':
						var table='bhyveslist';
						var operation='vm_obtain';
						break;
				}
				
				var injected=false;
				var n,nl;
				if(data.html!='undefined')
				{
					var trs=$('table#'+table+' tbody tr');
					for(n=0,nl=trs.length;n<nl;n++)
					{
						var tr=trs[n];
						var tid=$(tr).attr('id');
						if(data.jail_id<tid)
						{
							$(data.html).insertBefore(tr);
							injected=true;
							break;
						}
					}
					if(!injected)	//	Вставляем запись в конец таблицы
					{
						$(data.html).insertAfter(tr);
					}
				}
				this.dialogClose();
				this.enableWait(data.jail_id);
				this.tasks.add({'operation':operation,'jail_id':data.jail_id,'task_id':data.taskId});
				this.tasks.start();
			}
		}
	},
	onAuthkeyAdd:function(data)
	{
		try{
			var data=$.parseJSON(data);
		}catch(e){alert(e.message);return;}
		
		if(typeof data!='undefined' && !data.error)
		{
			var injected=false;
			var n,nl;
			if(data.html!='undefined')
			{
				var trs=$('table#authkeyslist tbody tr');
				for(n=0,nl=trs.length;n<nl;n++)
				{
					var tr=trs[n];
					var keyname=$('.keyname',tr).html();
					if(data.keyname<keyname)
					{
						$(data.html).insertBefore(tr);
						injected=true;
						break;
					}
				}
				if(!injected)	//	Вставляем запись в конец таблицы
				{
					$(data.html).insertAfter(tr);
				}
			}

			this.dialogClose();
		}
	},
	onVpnetAdd:function(data)
	{
		try{
			var data=$.parseJSON(data);
		}catch(e){alert(e.message);return;}
		
		if(typeof data!='undefined' && !data.error)
		{
			var injected=false;
			var n,nl;
			if(data.html!='undefined')
			{
				var trs=$('table#vpnetslist tbody tr');
				for(n=0,nl=trs.length;n<nl;n++)
				{
					var tr=trs[n];
					var netname=$('.netname',tr).html();
					if(data.netname<netname)
					{
						$(data.html).insertBefore(tr);
						injected=true;
						break;
					}
				}
				if(!injected)	//	Вставляем запись в конец таблицы
				{
					$(data.html).insertAfter(tr);
				}
			}

			this.dialogClose();
		}
	},
	
	getFreeJname:function()
	{
		this.loadData('freejname',$.proxy(this.onGetFreeJname,this));
	},
	onGetFreeJname:function(data)
	{
		try{
			var data=$.parseJSON(data);
		}catch(e){alert(e.message);return;}
		$('dialog#jail-settings input[name="jname"]').val(data.freejname);
		$('dialog#jail-settings input[name="host_hostname"]').val(data.freejname+'.my.domain');
	},
	
	loadData:function(mode,return_func,arr)
	{
		var path='/json.php';
		var posts={'mode':mode,'path':location.pathname};
		//if(typeof this.helper!='undefined') posts['helper']=this.helper;
		if(typeof arr=='object')
		{
			posts['form_data']={};
			for(n=0,nl=arr.length;n<nl;n++)
				posts['form_data'][arr[n]['name']]=arr[n]['value'];
		}
		$.post(path,posts,
			$.proxy(function(data){return_func(data);},this)
		);
	},
	
/* 	loadData1:function()
	{
		if(!this.jsonLoad) return;
		var file='/json.php';	//'/pages'+path+'a.json.php';
		this.loadDataJson(file,$.proxy(this.onLoadData,this),{'path':location.pathname,'mode':'getJsonPage'});
	},
	loadDataJson:function(file,return_func,arr)	//mode,
	{
		var posts=arr;
/-*
		var posts={'mode':mode,'project':this.project,'jail':this.jail,'module':this.module};
		if(typeof arr=='object')
		{
			posts['form_data']={};
			for(n=0,nl=arr.length;n<nl;n++)
				posts['form_data'][arr[n]['name']]=arr[n]['value'];
		}
*-/
		$.post(file,posts,
			$.proxy(function(data){return_func(data);},this));	
	}, */
	onLoadData:function(data)
	{
		try{
			var data=$.parseJSON(data);
		}catch(e){alert(e.message);return;}
		
		if(data.error)
		{
			var t=$('tbody.error td.error_message');
			if(typeof(data.error_message)!='undefined' && data.error_message!='') t.html(data.error_message);
			$(t).parents('table').addClass('error');
		}else{
			if(typeof data.func!='undefined')
			{
				this[data.func](data);
				return;
			}
			for(id in data) $('#'+id).html(data[id]);
		}
	},
	
	fillTable:function(data)
	{
		if(typeof data.id!='undefined')
		{
//			$('#'+data.id+' thead').html(data.thead);
			$('#'+data.id+' tbody').html(data.tbody);
		}
		if(typeof data.tasks!='undefined')
		{
			if(data.tasks!=null)
			{
				for(var t in data.tasks)
				{
					var task=data.tasks[t];
					var status=task.status;
					if(typeof task.task_cmd!='undefined')
					{
						var txt_status=task.txt_status;
						this.tasks.add({'operation':task.task_cmd,'jail_id':t,'status':status,'task_id':task.task_id,'txt_status':txt_status});
						$('tr#'+t+' .jstatus').html(this.translate(txt_status));
						this.enableWait(t);
					}
				}
				
				this.tasks.context=this;
				this.tasks.start();
			}
		}
	},
	
	enableWait:function(id,empty)
	{
		if(typeof empty=='undefined') empty=false;
		$('#'+id).addClass('busy');
		var icon_cnt=$('tr#'+id).find('span.icon-cnt');
		var icon=$(icon_cnt).find('span');
		if(!empty)
		{
			$(icon).removeClass('icon-play');
			$(icon).removeClass('icon-stop');
		}
		$(icon).addClass('icon-spin6 animate-spin');
	},
	enablePlay:function(id)
	{
		var icon_cnt=$('tr#'+id).find('span.icon-cnt');
		var icon=$(icon_cnt).find('span');
		if(icon[0]) icon[0].className='icon-play';
	},
	enableStop:function(id)
	{
		var icon_cnt=$('tr#'+id).find('span.icon-cnt');
		var icon=$(icon_cnt).find('span');
		if(icon[0]) icon[0].className='icon-stop';
	},
	enableRip:function(id)
	{
		var icon_cnt=$('tr#'+id).find('span.icon-cnt');
		if(typeof icon_cnt!='undefined' && icon_cnt.length>0)
		{
			var icon=$(icon_cnt).find('span');
			if(typeof icon!='undefined')
				icon[0].className='icon-emo-cry';
		}
	},
	
	jailStart:function(obj,opt)
	{
		if(typeof opt=='undefined') opt='jail';
		if(!obj) return;
		var id=this.getJailId(obj);
		
		var op1='jstart';var op2='jstop';
		if(opt=='bhyve') {op1='bstart';op2='bstop';}
		
		var icon_cnt=$(obj).find('span.icon-cnt');
		var icon=$(icon_cnt).find('span');
		op='';
		if($(icon).hasClass('icon-play')) op=op1;	//'jstart';
		if($(icon).hasClass('icon-stop')) op=op2;	//'jstop';
		this.enableWait(id);
		
//		var op_status=(op==op1?1:0);	//'jstart'
		
		if(op!='')
		{
			this.tasks.add({'operation':op,'jail_id':id});
			this.tasks.start();
		}
	},
	jailRestart:function(id,opt)
	{
		if(typeof opt=='undefined') opt='jail';
		var op='jrestart';
		var txt='jail';
		if(opt=='bhyve'){op='brestart';txt='virtual machine';}
		var c=confirm(this.translate('You want to restart selected '+txt+'! Are you sure?'));
		if(!c) return;
		this.enableWait(id);
		this.tasks.add({'operation':op,'jail_id':id});	//'jrestart'
		this.tasks.start();
	},
	jailRemove:function(id,opt)
	{
		if(typeof opt=='undefined') opt='jail';
		var op='jremove';
		var txt='jail';
		if(opt=='bhyve'){op='bremove';txt='virtual machine';}
		var c=confirm(this.translate('You want to delete selected '+txt+'! Are you sure?'));
		if(!c) return;
		this.enableWait(id);
		this.tasks.add({'operation':op,'jail_id':id});	//'jremove'
		this.tasks.start();
	},
	
	
	getJailId:function(obj)
	{
		var id=-1;
		id=$(obj).attr('id');
		return id;
		var cl=obj[0].className;
		var rx=new RegExp(/id-(\d+)/);
		if(res=cl.match(rx)) id=res[1];
		return id;
	},
	getJailById:function(id)
	{
		var nl=0,n=0;
		for(n=0,nl=this.jailsList.length;n<nl;n++)
		{
			if(this.jailsList[n].id==id) return this.jailsList[n];
		}
	},
	getJailNumById:function(id)
	{
		for(n=0,nl=this.jailsList.length;n<nl;n++)
		{
			if(this.jailsList[n].id==id) return n;
		}
	},
	getModuleById:function(id)
	{
		id=this.getJailId(id);
		var nl=0,n=0;
		for(n=0,nl=this.modulesList.length;n<nl;n++)
		{
			if(this.modulesList[n].id==id) return this.modulesList[n];
		}
	},
	playButt2Update:function(id)
	{
		if(!id) return;
		
		
		
		return;
		//if(!this.jail) return;
		//var jail=this.getJailById(this.jail);
		if(typeof jail.status!='undefined')
		{
			var status=jail.status;
			if(status==0)
			{
				this.playButt2Status('icon-play',this.translate('run jail'));
				var status='off';
				var status_txt='Jail is not launched';
			}else{
				this.playButt2Status('icon-stop',this.translate('stop jail'));
				var status='on';
				var status_txt='Jail is launched';
			}
			$('#left-menu .jail'+this.jail+'.status').removeClass('on off').addClass(status).attr('title',status_txt);
		}
	},
	playButt2Status:function(icon,txt)
	{
		$('#play-but-2 .ico').removeClass('icon-play icon-stop icon-attention').addClass('ico '+icon);
		$('#play-but-2 .txt').html(txt);
	},

	
	
	tasks:
	{
		context:null,
		tasks:{},
		interval:null,
		checkTasks:false,
		
		init:function(context)
		{
			this.context=context;
		},
		
		add:function(vars)
		{
			if(typeof vars['status']=='undefined') vars['status']=-1;
			if(typeof vars['jail_id']!='undefined')
				this.tasks[vars['jail_id']]=vars;
			if(typeof vars['modules_id']!='undefined')
				this.tasks['mod_ops']=vars;
			if(typeof vars['service_id']!='undefined')
				this.tasks[vars['service_id']]=vars;
			if(typeof vars['projects_id']!='undefined')
			{
				this.tasks['proj_ops']='projDelete';
				this.tasks[vars['projects_id']]=vars;
			}
		},
		
		start:function()
		{
			if(this.checkTasks) return;
			this.checkTasks=true;
			
			if($.isEmptyObject(this.tasks))
			{
				clearInterval(this.interval);
				this.interval=null;
				this.checkTasks=false;
				return;
			}
			
			var vars=JSON.stringify(this.tasks);
			this.context.loadData('getTasksStatus',$.proxy(this.update,this),[{'name':'jsonObj','value':vars}]);
		},
		
		update:function(data)
		{
			try{
				var data=$.parseJSON(data);
			}catch(e){alert(e.message);return;}
			
/* 			if(typeof data['mod_ops']!='undefined')
			{
				var key='mod_ops';
				this.tasks[key]=data[key];
				var d=data[key];
				
				if(d.status==2)
				{
					//this.context.onTaskEnd(this.tasks[key],key);
					//this.context.modulesUpdate(data);
					delete this.tasks[key];
					this.context.waitScreenHide();
				}
				if(d.status<2) this.context.waitScreenShow();
				
				this.checkTasks=false;
				if(this.interval===null)
				{
					this.interval=setInterval($.proxy(this.start,this),1000);
				}
				return;
				
			} */
			
/* 			if(typeof data['proj_ops']!='undefined')
			{
				if(data['proj_ops']=='projDelete')
				{
					if(typeof data.projects!='undefined')
						this.context.projectsList=data.projects;
					this.context.showProjectsList();
					return;
				}
			} */
			
			for(key in data)
			{
				$('tr#'+key+' .jstatus').html(data[key].txt_status);
				var errmsg=$('tr#'+key+' .errmsg');
				if(typeof data[key].errmsg!='undefined')
				{
					//$(errmsg).html('<span class="label">Error:</span>'+data[key].errmsg);
					$('tr#'+key).removeClass('busy');
					this.tasks[key].errmsg=data[key].errmsg;
				}
				this.tasks[key].operation=data[key].operation;
				this.tasks[key].task_id=data[key].task_id;
				this.tasks[key].status=data[key].status;
				this.tasks[key].txt_status=data[key].txt_status;
				
				if(data[key].status==2)
				{
					this.context.onTaskEnd(this.tasks[key],key);
					delete this.tasks[key];
				}
			}
			
			this.checkTasks=false;
			
			if(this.interval===null)
			{
				this.interval=setInterval($.proxy(this.start,this),1000);
			}

		},
	},
	onTaskEnd:function(task,id)
	{
		if(typeof task.errmsg!='undefined' && id!='mod_ops')
		{
			this.enablePlay(id);
			this.notify(task.errmsg,'error');
			
		//	Если ошибка при создании новой записи в таблице, то удаляем её через N секунд
			if(task.operation=='bcreate' || task.operation=='vm_obtain')
			{
				setTimeout(function(id){$('#'+id).remove();},5000,id);
			}
		}else{
			switch(task.operation)
			{
				case 'jcreate':
				case 'bcreate':
				case 'vm_obtain':
					var disp='s-off';
					if(typeof this.tmp_jail_info[id]!='undefined')
					{
						var runasap=this.tmp_jail_info[id]['runasap'];
						if(runasap==1) disp='s-on';
					}
					$('#'+id).removeClass('s-off').removeClass('s-on')
					$('#'+id).addClass(disp).removeClass('busy').removeClass('maintenance');
					this.enablePlay(id);
					//this.playButt2Update(id);
					break;
				case 'jstart':
				case 'jrestart':
				case 'bstart':
				case 'brestart':
					$('#'+id).removeClass('s-off').addClass('s-on').removeClass('busy');
					$('#'+id+' td.jstatus').html(this.translate(task.txt_status));
					this.enableStop(id);
					//this.playButt2Update(id);
					break;
				case 'jstop':
				case 'bstop':
					$('#'+id).removeClass('s-on').addClass('s-off').removeClass('busy');
					$('#'+id+' td.jstatus').html(this.translate(task.txt_status));
					this.enablePlay(id);
					//this.playButt2Update(id);
					break;
				case 'jedit':
					this.enableStop(id);
					break;
				case 'jremove':
				case 'bremove':
				case 'removesrc':
					$('#'+id+' td.jstatus').html(this.translate(task.txt_status));
					this.enableRip(id);
					window.setTimeout($.proxy(this.deleteItemsOk,this,id),2000);
					break;
				case 'jexport':
					this.enablePlay(id);
					break;
				case 'jimport':
					this.enablePlay(id);
					break;
				case 'jclone':
					var num=this.getJailNumById(id);
					var j=this.jailsList[num];
					if(typeof j.task_status!='undefined')
					{
						var status=j.task_status;
						if(status==0)
							this.enablePlay(id);
						else
							this.enableStop(id);
					}
					if(typeof j.new_ip!='undifined')
					{
						$('.jails tr.id-'+id+' .jip').html(j.new_ip);
					}
					this.currentPage='jails';
					break;
/*
				case 'modremove':
				case 'modinstall':
					this.modulesUpdate(task);
					break;
*/
				case 'sstart':
					this.enableStop(id);
					break;
				case 'sstop':
					this.enablePlay(id);
					break;
			}
		}
	},
	
	deleteItemsOk:function(id)
	{
		var tr=$('#'+id);
		var table=$(tr).closest('table');
		if(table && tr)
		{
			table[0].deleteRow(tr[0].rowIndex);
		}
	},
	
	authkeyRemove:function(id)
	{
		var c=confirm(this.translate('You want to delete selected authkey! Are you sure?'));
		if(!c) return;
		var posts=[{'name':'auth_id','value':id}];
		this.loadData('authkeyRemove',$.proxy(this.onAuthkeyRemove,this),posts);
	},
	onAuthkeyRemove:function(data)
	{
		try{
			var data=$.parseJSON(data);
		}catch(e){alert(e.message);return;}
		
		if(typeof data.error!='undefined')
		{
			if(data.error)
			{
				this.notify($res,'error');
				return;
			}
			
			$('#authkeyslist tr#'+data.auth_id).remove();
		}
	},
	
	vpnetRemove:function(id)
	{
		var c=confirm(this.translate('You want to delete selected network! Are you sure?'));
		if(!c) return;
		var posts=[{'name':'vpnet_id','value':id}];
		this.loadData('vpnetRemove',$.proxy(this.onVpnetRemove,this),posts);
	},
	onVpnetRemove:function(data)
	{
		try{
			var data=$.parseJSON(data);
		}catch(e){alert(e.message);return;}
		
		if(typeof data.error!='undefined')
		{
			if(data.error)
			{
				this.notify($res,'error');
				return;
			}
			
			$('#vpnetslist tr#'+data.vpnet_id).remove();
		}
	},
	
	mediaRemove:function(id)
	{
		var c=confirm(this.translate('You want to delete selected storage media! Are you sure?'));
		if(!c) return;
		var posts=[{'name':'media_id','value':id}];
		this.loadData('mediaRemove',$.proxy(this.onMediaRemove,this),posts);
	},
	onMediaRemove:function(data)
	{
		try{
			var data=$.parseJSON(data);
		}catch(e){alert(e.message);return;}
		
		if(typeof data.error!='undefined')
		{
			if(data.error)
			{
				this.notify($res,'error');
				return;
			}
			
			$('#mediaslist tr#'+data.media_id).remove();
		}
	},
	
	srcRemove:function(id)
	{
		var c=confirm(this.translate('You want to delete selected FreeBSD sources! Are you sure?'));
		if(!c) return;
		var ver=$('#srcslist tr#'+id+' .version').html();
//		alert(ver);
//		var posts=[{'name':'src_ver','value':ver}];
//		this.loadData('srcRemove',$.proxy(this.onSrcRemove,this),posts);
		
		var op='removesrc';
		this.enableWait(id);
		this.tasks.add({'operation':op,'jail_id':id});
		this.tasks.start();
	},

	
	logOpen:function(id)
	{
		var posts=[{'name':'log_id','value':id}];
		this.loadData('logLoad',$.proxy(this.onLogLoad,this),posts);
	},
	onLogLoad:function(data)
	{
		try{
			var data=$.parseJSON(data);
		}catch(e){alert(e.message);return;}
		
		if(typeof data.error!='undefined')
		{
			if(data.error)
			{
				this.notify($res,'error');
				return;
			}
		}
		
		$('dialog#tasklog .window-content').html(data.html);
		this.dialogShow1('tasklog');
	},
	
	bodyClick:function(event)
	{
		//debugger;
		var target=event.target;
		if($(target).parents('form').length>0) return;
		var elid=$(target).attr('id');
		
		/* ловим клики по выпадающему меню */
		if(typeof elid!='undefined')
		{
			switch(elid)
			{
				case 'jddm-edit':
					alert('Редактируем! :)');
					return;break;
				case 'jddm-clone':
					alert('Клонируем! :)');
					return;break;
				case 'jddm-export':
					alert('Экспортируем! :)');
					return;break;
				case 'jddm-helpers':
					alert('Хэлперы! :)');
					return;break;
			}
		}
		/* --- */
		
/*  		if(target.id=='main_chkbox')
		{
			this.mainChkBoxClick(event);
			return;
		} */
		
		var td=$(target).closest('td');
		td=td[0];
		var tr=$(target).closest('tr');
		var trc=$(tr).attr('class');
		var trid=$(tr).attr('id');
		var tbl=$(tr).closest('table');
		var tblid=$(tbl).attr('id');
		
		var opt='jail';
		if(tblid=='bhyveslist') opt='bhyve';

		var cl=target.className;
		switch(cl)
		{
			case 'icon-cancel':
				if(tblid=='authkeyslist')
				{
					this.authkeyRemove(trid);
					return;
				}
				if(tblid=='vpnetslist')
				{
					this.vpnetRemove(trid);
					return;
				}
				if(tblid=='mediaslist')
				{
					this.mediaRemove(trid);
					return;
				}
				if(tblid=='baseslist')
				{
					//this.mediaRemove(trid);
					return;
				}
				if(tblid=='srcslist')
				{
					this.srcRemove(trid);
					return;
				}
				this.jailRemove(trid,opt);
				return;break;
			case 'icon-arrows-cw':
				this.jailRestart(trid,opt);
				return;break;
			case 'icon-desktop':
				this.dialogShow(trid,'small');
				return;break;
			case 'icon-cog':
				this.DDMenuShow(trid,td,tr,event);
				return;break;
				
			case 'close-but':
				this.dialogClose();
				return;break;
			case 'btn-openlog':
				this.logOpen(trid);
				return;break;
		}
		
		if(cl.indexOf('cancel-but')>-1)
		{
			this.dialogClose();
			return;
		}
		if(cl.indexOf('ok-but')>-1)
		{
			var did=$(target).closest('dialog').attr('id');
			if(typeof did!='undefined') this.dialogSubmit(did);
			return;
		}
		
		if(cl.indexOf('top-button')>-1)
		{
			//if(cl.indexOf('id:jail-settings')>-1)
			if(cl.indexOf('id:')>-1)
			{
				this.dialogOpen(event);
				return;
			}
		}

		
/* 		if(target.tagName=='SPAN')
		{
			var cl=target.className;
			if(cl && cl.indexOf('install')>=0)
			{
				var res=cl.match(new RegExp(/helper-(\w+)/));
				if(res)
				{
					this.installHelper(res[1]);
					return;
				}
			}
			
			if(cl && cl.indexOf('default')>=0)
			{
				var res=cl.match(new RegExp(/val-(.*)/));
				if(res)
				{
					this.fillHelperDefault(target,res[1]);
					return;
				}
			}
		}
 */
/* 		if(target.tagName=='INPUT')
		{
			var cl=target.className;
			if(cl=='') return;
			if(cl=='save-helper-values') this.saveHelperValues();
			if(cl=='clear-helper') this.clearHelperForm(target);
			
			return;
		}
		
		if(typeof td!='undefined') this.selItem(tr);
		
		if(typeof tr[0]=='undefined') return;
		var cl=tr[0].className;
		if(!$(tr).hasClass('link')) return;
		var rx=new RegExp(/id-(\d+)/);
		if(res=cl.match(rx))
		{
			var id=res[1];
		} */
	//debugger;
		if(!td || typeof td.className=='undefined') return;
		var tdc=td.className;
		tdc=tdc.replace(' ','-');
		
		switch(tdc)
		{
			case 'ops':
				this.jailStart(tr,opt);
				return;break;
/* 			case 'sett-proj':
				this.lastProjectId=id;
				this.editMode='edit-proj';
				this.projSettings(id);
				return;break;
			case 'sett':
				this.lastJailId=id;
				this.editMode='edit';
				this.getJailSettings(tr);
				return;break;
			case 'jstatus':
				return;break;
			case 'info':
				this.loadData('getForm',$.proxy(this.loadForm,this));
				return;break;
			case 'mod-info':
				alert('show info about module!');
				return;break;
			case 'user-info':
				this.editMode='user-edit';
				var n;
				data=null;
				for(n=0,nl=this.usersList.length;n<nl;n++)
					if(this.usersList[n].id==id) {data=this.usersList[n];break;}
				if(data==null) return;
				var obj_cnt=this.settWinOpen('users');
				var form=$('form',obj_cnt);
				$('#window-content h1').html(this.translate('User edit'));
				$('input[name="login"]',form).val(data.login).attr('disabled','disabled');
				$('input[name="fullname"]',form).val(data.gecos);
				return;break;
 */		}
		
/*		if($(td).hasClass('chbx'))
		{
			// tr.link.hover.id-1
			if(this.currentPage=='project')
				if(id>0) this.selectedProjects[id]=$(td).children('input[type="checkbox"]').prop('checked');
			if(this.currentPage=='jails')
				if(id>0) this.selectedJails[id]=$(td).children('input[type="checkbox"]').prop('checked');
			if(this.currentPage=='modules')
				if(id>0) this.selectedModules[id]=$(td).children('input[type="checkbox"]').prop('checked');
			return;
		}
		
		switch(this.currentPage)
		{
			case 'project':
				location.hash='#prj-'+id;
				break;
			case 'jails':
				location.hash='#prj-'+this.project+'/jail-'+id;
				break;
			case 'modules':
				location.hash='#prj-'+this.project+'/jail-'+this.jail+'/module-'+id;
				break;
			case 'log':
				var hid=$('td.sp-id',tr).html();
				location.hash='#prj-'+this.project+'/jail-'+this.jail+'/log-'+hid;
				break;
			case 'helpers':
				var hid=$('td .sp-id',tr).html();
				location.hash='#prj-'+this.project+'/jail-'+this.jail+'/helpers-'+hid;
				break;
		}
		*/
	},
	
	ddmenu_interval:null,
	DDMenuShow:function(id,td,tr,event)
	{
		$(tr).addClass('sel');
		var coords=$(td).position();
		var menu=$('div#config-menu');
		var ccoords=$('div#content').position();
		var lpad=parseInt($(td).css('padding-left'),10);
		var tpad=parseInt($(td).css('padding-top'),10);
		if(menu.length>0)
		{
			$(menu).css({
				'left':coords.left+lpad/2-3,
				'top':coords.top+$('div#content').scrollTop()+tpad/2,
				'display':'block',
			});
		}
		
		this.test='test context';
		$(menu).unbind('mouseleave');
		$(menu).unbind('mouseenter');
		$(menu).bind('mouseleave',$.proxy(function(){
			this.ddmenu_interval=setInterval($.proxy(this.DDMenuClose,this),2000);
			$(document).unbind('click',$.proxy(this.DDMenuClose,this));
			$(document).bind('click',$.proxy(this.DDMenuClose,this));
		},this));
		$(menu).bind('mouseenter',$.proxy(function(){
			clearInterval(this.ddmenu_interval);
		},this));
	},
	DDMenuClose:function()
	{
		$('table tr.sel').removeClass('sel');
		var menu=$('div#config-menu');
		$(menu).css('display','none');
		clearInterval(this.ddmenu_interval);
		$(document).unbind('click',$.proxy(this.DDMenuClose,this));
		$(menu).unbind('mouseleave',$.proxy(this.DDMenuClose,this));
	},
	
	notify:function(message,type)
	{
		if(typeof type!='undefined') type='warning';
		noty({
			text        : message,
			type        : type,
			dismissQueue: true,
			layout      : 'bottomRight',
			theme       : 'defaultTheme',
		});
	},
}

$(window).load(function(){clonos.start();});
$(window).unload(function(){});	/* эта функция заставляет FireFox запускать JS-функции при нажатии кнопки «Назад»
http://stackoverflow.com/questions/2638292/after-travelling-back-in-firefox-history-javascript-wont-run */
$(document).ready(function(){clonos.loadData('getJsonPage',$.proxy(clonos.onLoadData,clonos));});