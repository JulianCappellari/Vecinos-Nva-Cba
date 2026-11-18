"use server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config(process.env.CLOUDINARY_URL ?? "");

const RedesEnum = z.enum([
  "Instagram",
  "Facebook",
  "Twitter",
  "Linkedin",
  "Web",
]);

const RedesSchema = z.object({
  url: z.string().url(),
  tipo: RedesEnum,
});

const RedesArraySchema = z.array(RedesSchema);

const direccionSchema = z.object({
  calle: z.string().max(255),
  altura: z.number().nullable(),
});

const LugarSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  nombre: z.string().min(3).max(255),
  barrio: z.string().min(3).max(255),
  tipo: z.array(z.string()).min(1),
  redes: RedesArraySchema.optional(),
  localizacion: z.string().max(255).nullable(),
  direccion: direccionSchema,
});

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}


export const crearLugar = async (formData: FormData) => {
    console.log("Form data:", formData);
  try {
    const tipos = formData.getAll("tipo").map((t) => t as string);
    const redes = formData.getAll("redes").map((r) => JSON.parse(r as string));
    

    const lugarData = {
      nombre: capitalizeFirstLetter(formData.get("nombre") as string),
      barrio: capitalizeFirstLetter(formData.get("barrio") as string),
      localizacion: formData.get("localizacion") as string,
      tipo: tipos.map(t => capitalizeFirstLetter(t)),
      direccion: JSON.parse(formData.get("direccion") as string)
    };

    const redesData = redes.map((r) => ({
      url: r.url,
      tipo: r.tipo,
    }));

    if (lugarData.direccion.altura === null) {
      lugarData.direccion.altura = 0;
    }

    const lugarValido = LugarSchema.safeParse(lugarData);

    if (!lugarValido.success) {
      console.error("Error parsing professional data:", lugarValido.error);
      return {
        ok: false,
        mensaje: lugarValido.error.message,
      };
    }

    const { id, ...restInfo } = lugarValido.data;

    const lugar = await prisma.lugar.create({
      data: {
        ...restInfo,
        direccion: {
          create: restInfo.direccion,
        },
        redes: {
          create: redesData,
        },
      },
    });
    // const lugar = await prisma.lugar.create({
    //     data: {
    //       ...restInfo,
    //       direccion: {
    //         create: restInfo.direccion,
    //       },
    //     },
    //   });

    const redesSociales = await prisma.redSocial.findMany({
      where: {
        url: {
          in: redesData.map((r) => r.url),
        },
      },
    });
    
    const newRedesSociales = redesData.filter((r) =>!redesSociales.some((rs) => rs.url === r.url));
    
    await prisma.redSocial.createMany({
      data: newRedesSociales.map((r) => ({
        url: r.url,
        tipo: r.tipo,
        lugarId: lugar.id,
      })),
    });
    
    
    
    

    const imagenes = formData.getAll("imagenes") as File[];
    console.log("Imagenes recibidas para cargar:", imagenes);
    if (imagenes.length > 0) {
      const imagenesCargadas = await cargarImagen(imagenes);

      if (!imagenesCargadas) {
        throw new Error("No se pudo cargar las imagenes, rollback");
      }

      // await prisma.imagen.createMany({
      //   data: imagenesCargadas.map((imagen) => ({
      //     url: imagen,
      //     lugarId: lugar.id,
      //   })),
      // });
      await prisma.imagen.createMany({
        data: imagenesCargadas
          .filter((imagen) => imagen !== null) // Filtrar imágenes nulas
          .map((imagen) => ({
            url: imagen!,
            lugarId: lugar.id,
          })),
      });
    } else {
      console.log("No hay imagenes");
    }

    return {
      ok: true,
      lugar: lugar,
    };
  } catch (error) {
    console.error("Error creating lugar:", error);
    return {
      ok: false,
      mensaje: "No se pudo crear el lugar desde backend",
    };
  }
};

const cargarImagen = async (imagenes: File[]) => {
  try {
    const cargarPromesas = imagenes.map(async (imagen) => {
      try {
        const buffer = await imagen.arrayBuffer();
        const base64Imagen = Buffer.from(buffer).toString("base64"); // Creo un string

        return cloudinary.uploader
          .upload(`data:image/png;base64,${base64Imagen}`, {
            folder: "lugares", // Opcional: especificar una carpeta en Cloudinary
            
          })
          .then((respuesta) => respuesta.secure_url);
      } catch (error) {
        console.log(error);
        return null;
      }
    });

    const imagenesActualizadas = await Promise.all(cargarPromesas);
    return imagenesActualizadas;
  } catch (error) {
    console.log(error);
    return null;
  }
};
