/**
         * CLASS DEFINITION 
         */

        // 1. Membuat Class Dasar (Abstract Class / Induk)
        class EntitasBase {
            constructor(id) {
                if (new.target === EntitasBase) {
                    throw new Error("Abstract Class 'EntitasBase' tidak bisa dibuat objeknya secara langsung.");
                }
                this.id = id;
            }

            getInfo() {
                return `Entitas [ID: ${this.id}]`;
            }
        }

        // 2. Class Turunan (Mewarisi EntitasBase)
        class SukuCadang extends EntitasBase {
            constructor(nama, stok, harga, id=null, kode=null) {
                super(id);
                // Tambahan: Auto-generate kode jika tidak diberikan
                this.kode = kode || 'SP-' + Math.floor(Math.random() * 9000 + 1000).toString();
                this.nama = nama;
                this._stok = parseInt(stok);
                this._harga = parseInt(harga);
            }

            // Implementasi Polimorfisme (Overriding)
            getInfo() {
                return `[${this.kode}] ${this.nama}`;
            }
            //getter
            get stok() { return this._stok; } 
            get harga() { return this._harga; } 
            
            // setter
            tambah(jml) { this._stok += parseInt(jml); }
            kurang(jml) { 
                if(this._stok >= jml) { this._stok -= parseInt(jml); return true; } 
                return false; 
            }
            // setter
            updateData(kode, nama, harga) {       
                if(kode) this.kode = kode; 
                this.nama = nama; 
                this._harga = parseInt(harga); 
            }
            setStok(jml) { this._stok = parseInt(jml); }
        }

        /**
         * =========================================
         * KONTROLER APLIKASI
         * =========================================
         */
        const app = {
            parts: [], 
            restokStack: [],
            formatRp: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }),

            init() {
                // Inisialisasi Data Dummy
                this.parts.push(new SukuCadang('Oli Mesin MPX 2 0.8L', 45, 55000, Date.now()+1, 'SP-1001'));
                this.parts.push(new SukuCadang('Kampas Rem Depan Cakram', 25, 45000, Date.now()+2, 'SP-1002'));
                this.parts.push(new SukuCadang('Busi NGK CPR9EA-9', 3, 20000, Date.now()+3, 'SP-1003'));
                
                this.pushInventoryLog('Oli Mesin MPX 2 0.8L', 45, 'MASUK');
                this.pushInventoryLog('Kampas Rem Depan Cakram', 25, 'MASUK');
                this.pushInventoryLog('Busi NGK CPR9EA-9', 3, 'MASUK');

                this.renderStok();
            },

            handlePartSubmit() {
                const id = document.getElementById('part-id-edit').value;
                const kodeInput = document.getElementById('part-kode').value.toUpperCase();
                const n = document.getElementById('part-nama').value;
                const s = parseInt(document.getElementById('part-stok').value);
                const h = document.getElementById('part-harga').value;
                      
                if(!n || isNaN(s) || !h) return alert("Lengkapi form nama, stok, dan harga!");
                
                if(id) {
                    // Update menggunakan Method Class
                    const idx = this.parts.findIndex(p => p.id == id);
                    if(idx !== -1) {
                        const diff = s - this.parts[idx].stok;
                        this.parts[idx].updateData(kodeInput, n, h);
                        this.parts[idx].setStok(s);
                        if (diff > 0) this.pushInventoryLog(n, diff, 'MASUK');
                        else if (diff < 0) this.pushInventoryLog(n, Math.abs(diff), 'KELUAR');
                    }
                } else {
                    // Instansiasi Objek Baru
                    this.parts.push(new SukuCadang(n, s, h, Date.now(), kodeInput || null));
                    this.pushInventoryLog(n, s, 'MASUK');
                }
                
                this.resetPartForm(); 
                this.renderStok();
            },

            editPart(id) {
                const p = this.parts.find(x => x.id == id);
                if(!p) return;
                document.getElementById('part-id-edit').value = p.id;
                document.getElementById('part-kode').value = p.kode || '';
                document.getElementById('part-nama').value = p.nama;
                document.getElementById('part-stok').value = p.stok; // Menggunakan Getter
                document.getElementById('part-harga').value = p.harga; // Menggunakan Getter
                
                document.getElementById('btn-save-part').innerText = "Update";
                document.getElementById('btn-cancel-part').classList.remove('hidden');
            },

            hapusPart(id) { 
                if(confirm("Hapus item suku cadang ini?")) { 
                    this.parts = this.parts.filter(p => p.id != id); 
                    this.renderStok(); 
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
                
                // Memanggil Method Class
                p.tambah(qty); 
                this.pushInventoryLog(p.nama, qty, 'MASUK');
                
                this.closeStokModal(); 
                this.renderStok();
            },

            pushInventoryLog(nama, qty, tipe) {
                const now = new Date();
                this.restokStack.push({ 
                    nama, 
                    qty, 
                    tipe, 
                    waktu: now.toLocaleTimeString('id-ID'), 
                    tanggal: now.toLocaleDateString('id-ID', {day:'2-digit', month:'short'}) 
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

            renderStok() {
                const tb = document.getElementById('table-stok-data'); 
                tb.innerHTML = '';
                const searchEl = document.getElementById('search-stok');
                const keyword = searchEl ? searchEl.value.toLowerCase() : '';

                const filteredParts = this.parts.filter(p => 
                    p.nama.toLowerCase().includes(keyword) || 
                    (p.kode && p.kode.toLowerCase().includes(keyword))
                );

                if(filteredParts.length === 0) tb.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-slate-400 italic">Suku cadang tidak ditemukan.</td></tr>`;

                filteredParts.forEach(p => {
                    const lw = p.stok < 5;
                    const actionBtns = `
                        <button onclick="app.editPart('${p.id}')" class="text-blue-500 hover:scale-110"><i class="fa-solid fa-pen"></i></button>
                        <button onclick="app.openStokModal('${p.id}','${p.nama}')" class="text-green-600 hover:scale-110"><i class="fa-solid fa-plus"></i></button>
                        <button onclick="app.hapusPart('${p.id}')" class="text-red-500 hover:scale-110"><i class="fa-solid fa-trash"></i></button>
                    `;

                    tb.innerHTML += `
                        <tr class="border-b hover:bg-slate-50 transition-all">
                            <td class="px-6 py-4">
                                <span class="text-[10px] font-black text-slate-400 block mb-0.5 tracking-wider">${p.kode}</span>
                                <span class="font-bold text-slate-700">${p.nama}</span>
                            </td>
                            <td class="px-6 py-4 text-center font-black ${lw ? 'text-red-500 bg-red-50 rounded-xl' : 'text-slate-800'}">${p.stok}</td>
                            <td class="px-6 py-4 text-right font-bold text-blue-600">${this.formatRp.format(p.harga)}</td>
                            <td class="px-6 py-4 text-center flex justify-center items-center gap-3 pt-6">${actionBtns}</td>
                        </tr>
                    `;
                });

                const lf = document.getElementById('stack-lifo-container'); 
                lf.innerHTML = '';
                if(this.restokStack.length === 0) lf.innerHTML = `<p class="text-slate-500 italic text-xs">Belum ada histori pergerakan stok.</p>`;
                
                [...this.restokStack].reverse().forEach(x => {
                    const isM = x.tipe === 'MASUK';
                    lf.innerHTML += `
                        <div class="relative pl-6 border-l-2 ${isM?'border-green-500':'border-red-500'} pb-4">
                            <div class="absolute -left-[7px] top-1 w-3 h-3 rounded-full border-2 border-slate-900 ${isM?'bg-green-500':'bg-red-500'}"></div>
                            <span class="block text-[10px] text-slate-400 font-bold uppercase mb-1">${x.tanggal} ${x.waktu}</span>
                            <span class="text-sm font-black ${isM?'text-green-400':'text-red-400'}">${isM?'+':'-'}${x.qty} ${x.nama}</span>
                        </div>
                    `;
                });
            }
        };

        // Jalankan aplikasi
        app.init();