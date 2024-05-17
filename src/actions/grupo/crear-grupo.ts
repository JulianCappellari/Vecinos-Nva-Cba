'use server'

import {z} from 'zod'
import prisma from '@/lib/prisma'
import { Grupo } from '@prisma/client'
import {v2 as cloudinary} from 'cloudinary';
cloudinary.config(process.env.CLOUDINARY_URL ?? '')


const GrupoSchema = z.object({
    id: z.string().uuid().optional().nullable(),
    nombre: z.string().min(3).max(255),
    descripcion: z.string().optional(),
    tipo: z.string().min(3).max(80),
    url: z.string().min(3).max(500),
})


export const crearGrupo = async (formData: FormData) => {
    try {
        const data = Object.fromEntries(formData);
        //console.log("Datos del formulario:", data);

        const grupoValidado = GrupoSchema.safeParse(data);
        if (!grupoValidado.success) {
            //console.error("Errores de validación:", grupoValidado.error);
            return { ok: false };
        }

        const grupo = grupoValidado.data;
        const { id, ...restInfo } = grupo;

        const transsaccionPrisma = await prisma.$transaction(async (transaccion) => {
            let grupo: Grupo;
            grupo = await prisma.grupo.create({
                data: {
                    ...restInfo,
                },
            });

            if (formData.getAll("imagen")) {
                const imagen = formData.get("imagen") as File;
                const urlImagen = await cargarImagen(imagen);

                if (!urlImagen) {
                    throw new Error("No se pudo cargar la imagen del grupo");
                }

                await prisma.grupo.update({
                    where: { id: grupo.id },
                    data: { imagen: urlImagen },
                });
            }

            return { grupo };
        });

        //console.log("Grupo creado:", transsaccionPrisma.grupo);

        return {
            ok: true,
            grupo: transsaccionPrisma.grupo,
        };
    } catch (error) {
        console.error("Error al crear el grupo:", error);
        return {
            ok: false,
            mensaje: "No se pudo crear el grupo",
        };
    }
};




const cargarImagen = async (imagen: File) => {
    try {
      const buffer = await imagen.arrayBuffer();
      const base64Imagen = Buffer.from(buffer).toString("base64");
      const resultado = await cloudinary.uploader.upload(`data:image/png;base64,${base64Imagen}`);
      return resultado.secure_url;
    } catch (error) {
      console.error(error);
      return null;
    }
  };