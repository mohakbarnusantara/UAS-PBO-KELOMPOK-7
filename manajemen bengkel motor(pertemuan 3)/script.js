/**
         * =========================================
         * [ABSTRACT CLASS]
         * =========================================
         */
        class EntitasBase {
            constructor(id) {
                if (new.target === EntitasBase) {
                    throw new Error("Abstract Class 'EntitasBase' tidak bisa dibuat objeknya secara langsung!");
                }
                this.id = id || Date.now();
            }

            getInfo() {
                return `ID: ${this.id}`;
            }
        }

        /**
         * =========================================
         * [INHERITANCE - KELAS TURUNAN]
         * =========================================
         */

        // Turunan 1: Motor mewarisi EntitasBase
        class Motor extends EntitasBase {
            constructor(plat, merk, tipe, pemilik, tahun, id=null) {
                super(id); 
                this.plat = plat.toUpperCase();
                this.merk = merk;
                this.tipe = tipe;
                this.pemilik = pemilik;
                this.tahun = tahun;
                this.statusTerakhir = 'NON-AKTIF';
            }

            getInfo() {
                return `Motor [${this.plat}] ${this.merk} ${this.tipe}`;
            }
        }

        // Turunan 2: SukuCadang mewarisi EntitasBase
        class SukuCadang extends EntitasBase {
            constructor(nama, stok, harga, id=null, kode=null) {
                super(id); 
                this.kode = kode || 'SP-' + Math.floor(Math.random() * 9000 + 1000);
                this.nama = nama;
                this._stok = parseInt(stok);
                this._harga = parseInt(harga);
            }

            getInfo() {
                return `[${this.kode}] ${this.nama}`;
            }

            get stok() { return this._stok; }
            get harga() { return this._harga; }

            tambah(jml) { this._stok += parseInt(jml); }
            kurang(jml) { 
                if(this._stok >= jml) { this._stok -= parseInt(jml); return true; } 
                return false; 
            }
            updateData(kode, nama, harga) { 
                if(kode) this.kode = kode; 
                this.nama = nama; 
                this._harga = parseInt(harga); 
            }
            setStok(jml) { this._stok = parseInt(jml); }
        }

      
        class AntrianItem {
            constructor(motorId, keluhan, nomor) {
                this.id = Date.now() + Math.floor(Math.random()*100);
                this.motorId = motorId;
                this.keluhan = keluhan;
                this.nomor = nomor; 
                this.status = 'ANTRIAN'; 
                this.waktu = new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit', second:'2-digit'});
                this.tanggal = new Date().toLocaleDateString('id-ID', {day:'2-digit', month:'short'});
            }
        }

        /**
         * =========================================
         * LOGIKA APLIKASI
         * =========================================
         */
        const app = {
            motors: [],
            parts: [],
            antrian: [], // Data Store Antrian
            restokStack: [],
            formatRp: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }),

            init() {
                this.startClock();
                
                // Dummy Data Motor (Berdasarkan Gambar)
                const m1 = new Motor('B 1234 ABC', 'Honda', 'Vario 150', 'Budi', 2020);
                m1.statusTerakhir = 'PROSES';
                this.motors.push(m1);
                
                const m2 = new Motor('D 5678 EFG', 'Yamaha', 'NMAX', 'Siti', 2022);
                m2.statusTerakhir = 'ANTRIAN';
                this.motors.push(m2);
                
                const m3 = new Motor('AB 9012 HI', 'Suzuki', 'GSX R150', 'Agus', 2019);
                m3.statusTerakhir = 'SELESAI';
                this.motors.push(m3);
                
                // Dummy Data Suku Cadang
                this.parts.push(new SukuCadang('Oli Mesin MPX 2 0.8L', 45, 55000, Date.now() + 1, 'SP-1001'));
                this.parts.push(new SukuCadang('Kampas Rem Depan Cakram', 25, 45000, Date.now() + 2, 'SP-1002'));
                this.parts.push(new SukuCadang('Busi NGK CPR9EA-9', 3, 20000, Date.now() + 3, 'SP-1003'));

                this.pushInventoryLog('Oli Mesin MPX 2 0.8L', 45, 'MASUK');
                this.pushInventoryLog('Kampas Rem Depan Cakram', 25, 'MASUK');
                this.pushInventoryLog('Busi NGK CPR9EA-9', 3, 'MASUK');

                // Dummy Data Antrian (Berdasarkan Gambar)
                const a1 = new AntrianItem(m1.id, 'Servis rutin dan ganti oli mesin', 1);
                a1.status = 'PROSES';
                this.antrian.push(a1);

                const a2 = new AntrianItem(m2.id, 'Rem depan blong, tolong di cek', 2);
                this.antrian.push(a2);
                
                this.render();
            },

            startClock() {
                const clockEl = document.getElementById('digital-clock');
                const dateEl = document.getElementById('current-date');
                const update = () => {
                    const now = new Date();
                    clockEl.innerText = now.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit', second:'2-digit'});
                    dateEl.innerText = now.toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'});
                };
                setInterval(update, 1000);
                update();
            },

            // LOGIKA MOTOR
            handleMotorSubmit(e) {
                e.preventDefault();
                const id = document.getElementById('m-id').value;
                const plat = document.getElementById('m-plat').value;
                const merk = document.getElementById('m-merk').value;
                const tipe = document.getElementById('m-tipe').value;
                const pemilik = document.getElementById('m-pemilik').value;
                const tahun = document.getElementById('m-tahun').value;

                if(id) {
                    const idx = this.motors.findIndex(m => m.id == id);
                    if(idx !== -1) {
                        const st = this.motors[idx].statusTerakhir;
                        this.motors[idx] = new Motor(plat, merk, tipe, pemilik, tahun, id);
                        this.motors[idx].statusTerakhir = st;
                    }
                } else {
                    const m = new Motor(plat, merk, tipe, pemilik, tahun);
                    this.motors.push(m);
                }
                
                this.resetMotorForm();
                this.render();
            },

            editMotor(id) {
                const m = this.motors.find(x => x.id == id);
                if(!m) return;
                document.getElementById('m-id').value = m.id;
                document.getElementById('m-plat').value = m.plat;
                document.getElementById('m-merk').value = m.merk;
                document.getElementById('m-tipe').value = m.tipe;
                document.getElementById('m-pemilik').value = m.pemilik;
                document.getElementById('m-tahun').value = m.tahun;
                
                document.getElementById('btn-save-motor').innerText = "Update Data";
                document.getElementById('btn-cancel-motor').classList.remove('hidden');
            },

            hapusMotor(id) {
                if(confirm("Hapus data motor ini?")) {
                    this.motors = this.motors.filter(m => m.id != id);
                    this.render();
                }
            },

            resetMotorForm() {
                document.getElementById('form-motor').reset();
                document.getElementById('m-id').value = '';
                document.getElementById('btn-save-motor').innerText = "Simpan Data";
                document.getElementById('btn-cancel-motor').classList.add('hidden');
            },

            // LOGIKA ANTRIAN SERVIS
            handleAntrianSubmit(e) {
                e.preventDefault();
                const mId = document.getElementById('antrian-motor-id').value;
                const keluhan = document.getElementById('antrian-keluhan').value;
                
                if(this.antrian.find(a => a.motorId == mId && a.status != 'SELESAI')) return alert("Motor sudah dalam antrian!");
                
                const nomorAntrian = this.antrian.length + 1;
                this.antrian.push(new AntrianItem(mId, keluhan, nomorAntrian));
                this.motors.find(x => x.id == mId).statusTerakhir = 'ANTRIAN';
                
                e.target.reset(); 
                this.render();
            },

            setProses(antrianId) {
                const item = this.antrian.find(a => a.id == antrianId);
                item.status = 'PROSES';
                this.motors.find(x => x.id == item.motorId).statusTerakhir = 'PROSES';
                this.render();
            },

            // LOGIKA GUDANG STOK
            handlePartSubmit() {
                const id = document.getElementById('part-id-edit').value;
                const kodeInput = document.getElementById('part-kode').value.toUpperCase();
                const n = document.getElementById('part-nama').value;
                const s = parseInt(document.getElementById('part-stok').value);
                const h = document.getElementById('part-harga').value;
                      
                if(!n || isNaN(s) || !h) return alert("Lengkapi form nama, stok, dan harga!");
                
                if(id) {
                    const idx = this.parts.findIndex(p => p.id == id);
                    if(idx !== -1) {
                        const diff = s - this.parts[idx].stok;
                        this.parts[idx].updateData(kodeInput, n, h);
                        this.parts[idx].setStok(s);
                        if (diff > 0) this.pushInventoryLog(n, diff, 'MASUK');
                        else if (diff < 0) this.pushInventoryLog(n, Math.abs(diff), 'KELUAR');
                    }
                } else {
                    this.parts.push(new SukuCadang(n, s, h, Date.now(), kodeInput || null));
                    this.pushInventoryLog(n, s, 'MASUK');
                }
                this.resetPartForm(); 
                this.render();
            },

            editPart(id) {
                const p = this.parts.find(x => x.id == id);
                if(!p) return;
                document.getElementById('part-id-edit').value = p.id;
                document.getElementById('part-kode').value = p.kode || '';
                document.getElementById('part-nama').value = p.nama;
                document.getElementById('part-stok').value = p.stok;
                document.getElementById('part-harga').value = p.harga;
                
                document.getElementById('btn-save-part').innerText = "Update";
                document.getElementById('btn-cancel-part').classList.remove('hidden');
            },

            hapusPart(id) { 
                if(confirm("Hapus item?")) { 
                    this.parts = this.parts.filter(p => p.id != id); 
                    this.render(); 
                } 
            },

            openStokModal(id, nm) { 
                document.getElementById('restok-id').value = id; 
                document.getElementById('restok-label').innerText = nm; 
                document.getElementById('restok-qty').value = 1;
                document.getElementById('modal-stok').classList.replace('hidden','flex'); 
            },

            closeStokModal() { 
                document.getElementById('modal-stok').classList.replace('flex','hidden'); 
            },

            prosesRestok() {
                const id = document.getElementById('restok-id').value;
                const qty = parseInt(document.getElementById('restok-qty').value);
                const p = this.parts.find(x => x.id == id);
                if (p) {
                    p.tambah(qty); 
                    this.pushInventoryLog(p.nama, qty, 'MASUK');
                    this.closeStokModal(); 
                    this.render();
                }
            },

            pushInventoryLog(nama, qty, tipe) {
                const now = new Date();
                const months = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];
                const tanggalStr = `${now.getDate()} ${months[now.getMonth()]}`;
                const waktuStr = now.toLocaleTimeString('id-ID').replace(/:/g, '.');
                
                this.restokStack.push({ 
                    nama, 
                    qty, 
                    tipe, 
                    waktu: waktuStr, 
                    tanggal: tanggalStr 
                });
                if(this.restokStack.length > 25) this.restokStack.shift(); 
            },

            resetPartForm() { 
                document.getElementById('part-id-edit').value = ''; 
                document.getElementById('part-kode').value = ''; 
                document.getElementById('part-nama').value = ''; 
                document.getElementById('part-stok').value = ''; 
                document.getElementById('part-harga').value = ''; 
                document.getElementById('btn-save-part').innerText = "Tambah"; 
                document.getElementById('btn-cancel-part').classList.add('hidden'); 
            },

            // MASTER RENDER
            render() {
                this.renderMotors();
                this.renderStok();
                this.renderSelects();
                this.renderAntrian();
            },

            renderSelects() {
                // Populate Dropdown Form Antrian
                const sa = document.getElementById('antrian-motor-id'); 
                sa.innerHTML = '<option value="">-- Pilih Motor --</option>';
                
                this.motors.filter(m => m.statusTerakhir !== 'PROSES' && m.statusTerakhir !== 'ANTRIAN').forEach(m => {
                    sa.innerHTML += `<option value="${m.id}">${m.plat} (${m.pemilik})</option>`;
                });
            },

            renderAntrian() {
                const c = document.getElementById('list-antrian-container'); 
                c.innerHTML = '';
                
                const searchEl = document.getElementById('search-antrian');
                const keyword = searchEl ? searchEl.value.toLowerCase() : '';

                const antrianAktif = this.antrian.filter(x => x.status != 'SELESAI');
                
                const filteredA = antrianAktif.filter(node => {
                    const m = this.motors.find(x => x.id == node.motorId);
                    if(!m) return false;
                    return m.plat.toLowerCase().includes(keyword) || m.pemilik.toLowerCase().includes(keyword) || node.keluhan.toLowerCase().includes(keyword);
                });

                if(filteredA.length === 0) {
                    c.innerHTML = `<p class="text-slate-400 italic text-sm text-center mt-4">Pencarian tidak menemukan antrian.</p>`;
                }
                
                filteredA.forEach(node => {
                    const m = this.motors.find(x => x.id == node.motorId);
                    const pr = node.status === 'PROSES';
                    
                    c.innerHTML += `
                        <div class="bg-white p-5 rounded-2xl border flex justify-between items-center ${pr ? 'border-blue-300 ring-4 ring-blue-50' : 'border-slate-100 shadow-sm'}">
                            <div class="flex items-start gap-4">
                                <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 shrink-0 text-sm">#${node.nomor.toString().padStart(2, '0')}</div>
                                <div>
                                    <div class="flex items-center gap-3 mb-1">
                                        <span class="font-black text-lg text-slate-800 uppercase">${m ? m.plat : '??'}</span>
                                        <span class="status-badge ${pr ? 'status-proses' : 'status-antrian'}">${node.status}</span>
                                    </div>
                                    <p class="text-xs text-slate-500 font-bold mb-2">Pemilik: ${m ? m.pemilik : '??'} (${node.tanggal} ${node.waktu})</p>
                                    <p class="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border italic">"${node.keluhan}"</p>
                                </div>
                            </div>
                            <div>
                                ${!pr ? `<button onclick="app.setProses('${node.id}')" class="bg-blue-600 text-white px-5 py-3 rounded-xl text-xs font-black shadow-lg">KERJAKAN</button>` : `<i class="fa-solid fa-spinner animate-spin text-blue-500 text-2xl mr-4"></i>`}
                            </div>
                        </div>
                    `;
                });
            },

            renderMotors() {
                const tMotor = document.getElementById('table-motor');
                tMotor.innerHTML = '';
                
                const searchMotorEl = document.getElementById('search-motor');
                const keywordMotor = searchMotorEl ? searchMotorEl.value.toLowerCase() : '';

                const filteredMotors = this.motors.filter(m => 
                    m.plat.toLowerCase().includes(keywordMotor) || 
                    m.pemilik.toLowerCase().includes(keywordMotor) || 
                    m.merk.toLowerCase().includes(keywordMotor) ||
                    m.tipe.toLowerCase().includes(keywordMotor)
                );

                if(filteredMotors.length === 0) {
                    tMotor.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-slate-400 italic">Kendaraan tidak ditemukan</td></tr>`;
                } else {
                    filteredMotors.forEach(m => {
                        const sc = m.statusTerakhir === 'ANTRIAN' ? 'status-antrian' : (m.statusTerakhir === 'PROSES' ? 'status-proses' : (m.statusTerakhir === 'SELESAI' ? 'status-selesai' : 'status-nonaktif'));
                        tMotor.innerHTML += `
                            <tr class="border-b hover:bg-slate-50 transition-all">
                                <td class="px-6 py-4 font-black text-slate-800 uppercase">${m.plat}</td>
                                <td class="px-6 py-4 font-bold text-slate-700">${m.merk} <span class="font-normal text-slate-400">${m.tipe}</span></td>
                                <td class="px-6 py-4 text-slate-600 capitalize">${m.pemilik}</td>
                                <td class="px-6 py-4 text-center"><span class="status-badge ${sc}">${m.statusTerakhir}</span></td>
                                <td class="px-6 py-4 text-center">
                                    <div class="flex justify-center items-center gap-3">
                                        <button onclick="app.editMotor('${m.id}')" class="text-blue-500 hover:scale-110" title="Edit"><i class="fa-solid fa-pen"></i></button>
                                        <button onclick="app.hapusMotor('${m.id}')" class="text-red-500 hover:scale-110" title="Hapus"><i class="fa-solid fa-trash"></i></button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    });
                }
            },

            renderStok() {
                const tPart = document.getElementById('table-part');
                tPart.innerHTML = '';
                
                const searchPartEl = document.getElementById('search-stok');
                const keywordPart = searchPartEl ? searchPartEl.value.toLowerCase() : '';

                const filteredParts = this.parts.filter(p => 
                    p.nama.toLowerCase().includes(keywordPart) || 
                    (p.kode && p.kode.toLowerCase().includes(keywordPart))
                );

                if(filteredParts.length === 0) {
                    tPart.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-slate-400 italic">Suku cadang tidak ditemukan</td></tr>`;
                } else {
                    filteredParts.forEach(p => {
                        const lw = p.stok < 5;
                        const actionBtns = `
                            <button onclick="app.editPart('${p.id}')" class="text-blue-500 hover:scale-110" title="Edit"><i class="fa-solid fa-pen"></i></button>
                            <button onclick="app.openStokModal('${p.id}','${p.nama}')" class="text-green-600 hover:scale-110" title="Restok"><i class="fa-solid fa-plus"></i></button>
                            <button onclick="app.hapusPart('${p.id}')" class="text-red-500 hover:scale-110" title="Hapus"><i class="fa-solid fa-trash"></i></button>
                        `;

                        tPart.innerHTML += `
                            <tr class="border-b hover:bg-slate-50 transition-all">
                                <td class="px-6 py-4">
                                    <span class="text-[10px] font-black text-slate-400 block mb-0.5 tracking-wider">${p.kode}</span>
                                    <span class="font-bold text-slate-700">${p.nama}</span>
                                </td>
                                <td class="px-6 py-4 text-center">
                                    <span class="font-black ${lw ? 'text-red-500 bg-red-50 px-3 py-1 rounded-xl' : 'text-slate-800'}">
                                        ${p.stok}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right font-black text-blue-600">${this.formatRp.format(p.harga)}</td>
                                <td class="px-6 py-4 text-center">
                                    <div class="flex justify-center items-center gap-3">
                                        ${actionBtns}
                                    </div>
                                </td>
                            </tr>
                        `;
                    });
                }

                // Render Histori Log
                const lf = document.getElementById('stack-lifo-container'); 
                lf.innerHTML = '';
                if(this.restokStack.length === 0) {
                    lf.innerHTML = `<p class="text-slate-500 italic text-xs">Belum ada histori pergerakan stok.</p>`;
                } else {
                    [...this.restokStack].reverse().forEach(x => {
                        const isM = x.tipe === 'MASUK';
                        lf.innerHTML += `
                            <div class="relative pl-6 border-l-2 ${isM ? 'border-green-500' : 'border-red-500'} pb-4">
                                <div class="absolute -left-[7px] top-1 w-3 h-3 rounded-full border-2 border-slate-900 ${isM ? 'bg-green-500' : 'bg-red-500'}"></div>
                                <span class="block text-[10px] text-slate-400 font-bold uppercase mb-1">${x.tanggal} ${x.waktu}</span>
                                <span class="text-sm font-black ${isM ? 'text-green-400' : 'text-red-400'}">${isM ? '+' : '-'}${x.qty} ${x.nama}</span>
                            </div>
                        `;
                    });
                }
            }
        };

        const ui = {
            nav(id) {
                document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
                document.getElementById(id).classList.add('active');
                
                document.querySelectorAll('.sidebar-btn').forEach(b => {
                    b.classList.remove('active');
                    if(b.dataset.id === id) b.classList.add('active');
                });
            }
        };

        // Mulai aplikasi
        app.init();