export default function AdminNewProjectPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32">
      {/* Header */}
      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">
          Dashboard / Portafolio / Nuevo Proyecto
        </p>
        <h1 className="text-4xl font-black uppercase tracking-tighter">NUEVO PROYECTO</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Form Column */}
        <div className="lg:col-span-7 space-y-6">
           <div>
              <label className="block text-sm font-bold uppercase tracking-widest mb-2">Título del Proyecto</label>
              <input type="text" className="w-full p-4 brutalist-border bg-white focus:outline-none focus:ring-2 focus:ring-black" />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-sm font-bold uppercase tracking-widest mb-2">Nombre de la Pareja</label>
                <input type="text" placeholder="Ej. María & Carlos" className="w-full p-4 brutalist-border bg-white focus:outline-none focus:ring-2 focus:ring-black" />
             </div>
             <div>
                <label className="block text-sm font-bold uppercase tracking-widest mb-2">Ubicación</label>
                <input type="text" placeholder="Ej. Cancún, QR" className="w-full p-4 brutalist-border bg-white focus:outline-none focus:ring-2 focus:ring-black" />
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-sm font-bold uppercase tracking-widest mb-2">Fecha del Evento</label>
                <input type="date" className="w-full p-4 brutalist-border bg-white focus:outline-none focus:ring-2 focus:ring-black" />
             </div>
             <div>
                <label className="block text-sm font-bold uppercase tracking-widest mb-2">Categoría</label>
                <select className="w-full p-4 brutalist-border font-bold uppercase text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white appearance-none cursor-pointer">
                  <option>Bodas</option>
                  <option>Pre-boda</option>
                  <option>Detalles</option>
                  <option>Recepción</option>
                </select>
             </div>
           </div>

           <div>
              <label className="block text-sm font-bold uppercase tracking-widest mb-2">Descripción</label>
              <textarea rows={6} className="w-full p-4 brutalist-border bg-white focus:outline-none focus:ring-2 focus:ring-black resize-none" />
           </div>
        </div>

        {/* Right Media Column */}
        <div className="lg:col-span-5 space-y-8">
           <div>
             <h3 className="text-lg font-black uppercase tracking-widest mb-4">Imágenes del Proyecto</h3>
             <div className="border-4 border-dashed border-black bg-gray-50 p-12 text-center cursor-pointer hover:bg-gray-100 transition-colors">
               <p className="font-bold uppercase tracking-widest text-sm">Arrastra tus imágenes aquí</p>
               <p className="text-xs text-gray-500 mt-2 uppercase font-bold">o haz clic para seleccionar</p>
             </div>
           </div>

           {/* Thumbnails Placeholder */}
           <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="relative aspect-square bg-gray-300 border-2 border-black group">
                   <button className="absolute top-1 right-1 bg-white border-2 border-black w-6 h-6 flex items-center justify-center font-bold text-xs hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors">X</button>
                   {item === 1 && <span className="absolute bottom-0 left-0 right-0 bg-black text-white text-[10px] font-bold text-center uppercase tracking-widest p-1">PORTADA</span>}
                </div>
              ))}
           </div>

           <hr className="border-2 border-black" />

           <div className="space-y-6">
             <div>
                <label className="block text-sm font-bold uppercase tracking-widest mb-2">Estado</label>
                <select className="w-full p-3 brutalist-border font-bold uppercase text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white appearance-none cursor-pointer">
                  <option>Borrador</option>
                  <option>Publicado</option>
                </select>
             </div>
             
             <div>
                <label className="block text-sm font-bold uppercase tracking-widest mb-2">Orden de Visualización</label>
                <input type="number" defaultValue={0} min={0} className="w-full p-3 brutalist-border bg-white focus:outline-none focus:ring-2 focus:ring-black" />
             </div>
           </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 right-0 left-64 bg-white border-t-4 border-black p-6 flex justify-end items-center gap-6 z-40">
         <button className="font-bold uppercase tracking-widest text-sm text-gray-500 hover:text-black hover:underline transition-all">Cancelar</button>
         <button className="bg-white text-black px-8 py-3 font-bold uppercase tracking-widest text-sm brutalist-border hover:bg-gray-100 transition-colors brutalist-shadow-hover">
           Guardar como Borrador
         </button>
         <button className="bg-black text-white px-8 py-3 font-bold uppercase tracking-widest text-sm brutalist-border hover:bg-white hover:text-black transition-colors brutalist-shadow-hover">
           Guardar Proyecto
         </button>
      </div>
    </div>
  );
}
