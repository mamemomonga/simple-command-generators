
function AppMain(){}
AppMain.prototype={

	run: function(target) {
		var t=this;

		$('form').change((e)=>{
			t[target](e.target.id);
		});

		$('#result').click(()=>{
			t.select_all($('#result')[0]);
		});

		t[target]();

	},

	select_all: function(el) {
		if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
			const range = document.createRange();
 			range.selectNodeContents(el);
			const sel = window.getSelection();
			sel.removeAllRanges(); sel.addRange(range);
			return true;
		}
		if (typeof document.selection != "undefined" && typeof document.body.createTextRange != "undefined") {
			const textRange = document.body.createTextRange();
			textRange.moveToElementText(el);
			textRange.select();
			return true;
		}
		return false;
	},

	hexadec: function(hd) {
		const s=hd.split(/:|\./);
		let r=[];
		for(const i in s) {
			const m=s[i].match(/[0-9]+/);
			if(m) { r.push(m[0]) }
		}
		let n=0;
		for(const i in r) {
			const m=r.length-i-1;
			const v=parseInt(r[i]);
			n = (m>0) ? n+Math.pow(60,m)*v : n+v;
		}
		return n;
	},

	hexaenc: function(num) {
		const t=this;
		const h=Math.floor(num/3600);
		const m=Math.floor((num-(h*3600))/60);
		const s=Math.floor(num-(h*3600)-(m*60));
		return t.pad(h,2)+':'+t.pad(m,2)+':'+t.pad(s,2);
	},

	pad: function(n, width, z) {
		z = z || '0'; n = n + '';
		return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	},

	ffmpeg: function(id) {
		const t=this;
		let cmds=["ffmpeg"];

		let vf=[];
		let af=[];

		(()=>{
			const v=t.hexadec($('#time_start').val()) || 0;
			t.time_start=v;
			cmds.push("-ss", v);
			$('#time_start').val(t.hexaenc(v));
		})();

		(()=>{
			const v=t.hexadec($('#time_end').val()) || 0;
			if(!v) return;
			if(id == 'duration') return;
			const dur=v-t.time_start;
			$('#duration').val(dur);
			$('#time_end').val(t.hexaenc(v));
		})();

		(()=>{
			const v=t.hexadec($('#duration').val());
			if(!v) return;
			cmds.push("-t", v);
			if(id == 'time_end') return;
			$('#time_end').val(t.hexaenc(t.time_start+v));
		})();

		{
			const fin = $('#infile').val();
			if(fin !== "") { cmds.push("-i",'"'+fin+'"'); }
		}
		{
			const sp=$('#speed').val().match(/([0-9.]+)/);
			if(sp) {
				vf.push("setpts=PTS/"+sp[1]);
				af.push("atempo="+sp[1]);
			} 
		}
		switch($('#resize').val()) {
			case '720':
				vf.push("scale=-1:720");
		}

		if(vf.length > 0) cmds.push("-vf",'"'+vf.join(",")+'"')
		if(af.length > 0) cmds.push("-af",'"'+af.join(",")+'"')

		{
			const au=$('#video').val();
			switch(au) {
				case 'nc': break;
				case '2000': cmds.push('-c:v','libx264','-b:v','2000k'); break;
			}
		}
		{
			const au=$('#audio').val();
			switch(au) {
				case '':   cmds.push("-an"); break;
				case 'nc': break;
				case '96': cmds.push('-c:a','aac','-ar','48000','-b:a','96k'); break;
			}
		}
		if( $('#max_muxing_queue_size_400')[0].checked) {
			cmds.push("-max_muxing_queue_size","400");
		}

		{
			const fout = $('#outfile').val();
			if(fout !== "") { cmds.push('"'+fout+'"'); }
		}

		$('#result').text(cmds.join(" "));

	},

};

