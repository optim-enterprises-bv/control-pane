<script type="text/javascript">
err_messages.add({
	'vm_name':'<span id="trlt-83">Не может быть пустым. Имя должно начинаться и содержать латинские буквы / a-z / и не должно иметь спец. символы: -,.=% и тд.</span>',
	'vm_size':'<span id="trlt-241">You need type «g» char after numbers</span>',
	'vm_ram':'<span id="trlt-241">You need type «g» char after numbers</span>',
});
<?php
//print_r($this->config->os_types);exit;
?>
</script>
<dialog id="bhyve-new" class="window-box">
	<h1>
		<span class="new"><span id="trlt-95">Создание виртуальной машины</span></span>
		<span class="edit"><span id="trlt-242">Правка виртуальной машины</span></span>
	</h1>
	<h2><span id="trlt-97">Настройки</span></h2>
	<form class="win" method="post" id="bhyveSettings" onsubmit="return false;">
		<div class="window-content">
			<p class="new">
				<span class="field-name"><span id="trlt-99">Профиль операционной системы</span>:</span>
				<select name="vm_os_profile" onchange="clonos.onChangeOsProfile(this,event);">
					<?php echo $this->config->os_types_create(); ?>
				</select>
			</p>
			<p>
				<span class="field-name"><span id="trlt-98">Имя виртуальной машины</span>:</span>
				<input type="text" name="vm_name" value="" pattern="[^0-9]{1}[a-zA-Z0-9]{1,}" required="required" class="edit-disable" />
			</p>
			<p class="new">
				<span class="field-name"><span id="trlt-243">VM template (cpu, ram, hdd)</span>:</span>
				<select name="vm_packages" onchange="clonos.onChangePkgTemplate(this,event);">
					<?php $vm_res=$this->config->vm_packages_list(); echo $vm_res['html']; ?>
				</select>
				<script type="text/javascript">clonos.vm_packages_new_min_id=<?php echo $vm_res['min_id']; ?>;</script>
			</p>
			<p>
				<span class="field-name"><span id="trlt-101">Количество виртуальных ядер</span>:</span>
				<span class="range">
					<input type="range" name="vm_cpus" class="vHorizon" min="1" max="16" value="1" style="margin:6px 0;" id="rngCpus" oninput="rngCpusShow.value=rngCpus.value" />
					<input type="text" disabled="disabled" id="rngCpusShow" value="1" name="vm_cpus_show" />
					<!-- input type="text" name="vm_cpus" value="" pattern="[0-9]+" placeholder="1" required="required" / -->
				</span>
			</p>
			<p>
				<span class="field-name"><span id="trlt-102">Объём памяти</span>:</span>
<!--				<input type="text" name="vm_ram" value="" pattern="^[0-9]+\s*(g|gb|mb|m|t|tb)$" placeholder="1g" required="required" /> -->
				<span class="range">
					<input type="range" name="vm_ram" class="vHorizon" min="1" max="64" value="1" style="margin:6px 0;" id="rngRam" oninput="rngRamShow.value=rngRam.value+'g'" />
					<input type="text" disabled="disabled" id="rngRamShow" value="1" name="vm_ram_show" />
				</span>
			</p>
			<p class="new">
				<span class="field-name"><span id="trlt-103">Объём виртуального диска</span>:</span>
<!--				<input type="text" name="vm_size" value="" pattern="^[0-9]+(g|gb|t|tb)$" placeholder="10g" required="required" class="edit-disable" /> -->
				<span class="range">
					<input type="range" name="vm_imgsize" class="vHorizon" min="20" max="866" value="20" style="margin:6px 0;" id="rngImgsize" oninput="rngImgsizeShow.value=rngImgsize.value+'g'" />
					<input type="text" disabled="disabled" id="rngImgsizeShow" value="1" name="vm_imgsize_show" />
				</span>
			</p>
			<p>
				<span class="field-name"><span id="trlt-244">Attached boot ISO image</span>:</span>
				<select name="vm_iso_image">
					<option value="-2"></option>
					<option value="-1" selected>Профиль по умолчанию ISO</option>
					<?php echo $this->media_iso_list_html(); ?>
				</select>
			</p>
			<p>
				<span class="field-name"><span id="trlt-246">VNC IP address</span>:</span>
				<input type="radio" name="bhyve_vnc_tcp_bind" value="127.0.0.1" id="vncip0" checked="checked" class="inline"><label for="vncip0">127.0.0.1</label></radio>
				<input type="radio" name="bhyve_vnc_tcp_bind" value="0.0.0.0" id="vncip1" class="inline"><label for="vncip1">0.0.0.0</label></radio>
			</p>
			<p>
				<span class="field-name"><span id="trlt-104">Порт для подключения VNC клиента (0 - авто)</span>:</span>
				<input type="text" name="vm_vnc_port" value="" placeholder="0" maxlength="5" />
			</p>
			<p>
				<span class="field-name"><span id="trlt-247">Пароль VNC</span>:</span>
				<input type="password" name="vm_vnc_password" value="" placeholder="3-20 symbols" pattern=".{3,20}" maxlength="20"></input> <small>— <span id="trlt-248">используется для входа в VNC консоль</span></small>
			</p>
<!--			<p>
				<span class="field-name"><span id="trlt-249">CD-ROM ISO</span>:</span>
				<select name="cd-rom">
					<option value="profile">profile</option>
				</select>
			</p>
-->			<p>
				<span class="field-name"><span id="trlt-64">привязать к сетевому интерфейсу</span>:</span>
				<!-- <input type="radio" name="interface" value="auto" id="rint0" checked="checked" class="inline"><label for="rint0">auto</label></radio> -->
				<select name="interface">
					<option value="auto">авто</option>
<?php echo $this->get_interfaces_html(); ?>
				</select>
			</p>
		</div>
	</form>
	<div class="buttons">
		<input type="button" value="Создать" class="new button ok-but" />
		<input type="button" value="Сохранить" class="edit button ok-but" />
		<input type="button" value="Отменить" class="button red cancel-but" />
	</div>
</dialog>
