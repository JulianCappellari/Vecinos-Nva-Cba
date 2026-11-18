"use server";

import { any, z } from "zod";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config(process.env.CLOUDINARY_URL ?? "");
// console.log("Cloudinary configuración:", cloudinary.config());

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

const ProfesionalSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  nombre: z.string().min(3).max(255),
  apellido: z.string().min(3).max(255),
  trabajo: z.array(z.string()).min(1),
  numero: z.string().min(8).max(15),
  redes: RedesArraySchema.optional(),
});

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// export const crearProfesional = async (formData: FormData) => {
//   console.log("Form data:", formData);

//   try {
//     const trabajos = formData.getAll("trabajo").map((t) => t as string);
//     const redes = formData.getAll("redes").map((r) => JSON.parse(r as string));

//     const profesionalData = {
//       nombre: formData.get("nombre") as string,
//       apellido: formData.get("apellido") as string,
//       numero: formData.get("numero") as string,
//       trabajo: trabajos,
//     };

//     console.log("Profesional data:", profesionalData);

//     const redesData = redes.map((r) => ({
//       url: r.url,
//       tipo: r.tipo,
//     }));

//     const profesionalValido = ProfesionalSchema.safeParse(profesionalData);
//     console.log("Profesional válido:", profesionalValido);

//     if (!profesionalValido.success) {
//       console.error(
//         "Error parsing professional data:",
//         profesionalValido.error
//       );
//       return {
//         ok: false,
//         mensaje: profesionalValido.error.message,
//       };
//     }

//     const { id, ...restInfo } = profesionalValido.data;
//     console.log("Datos del profesional a crear:", restInfo);

//     const transaccionPrisma = await prisma.$transaction(async (transaccion) => {
//       try {
//         const profesional = await transaccion.profesional.create({
//           data: restInfo, // Utiliza restInfo que ya está validado
//         });

//         console.log("Profesional creado:", profesional);

//         const redesSociales = await transaccion.redSocial.createMany({
//           data: redesData.map((r) => ({
//             url: r.url,
//             tipo: r.tipo,
//             profesionalId: profesional.id,
//           })),
//         });

//         console.log("Redes sociales creadas:", redesSociales);

//         const imagenes = formData.getAll("imagen") as File[];
//         console.log("Imagenes recibidas para cargar:", imagenes);
//         if (imagenes.length > 0) {
//           const imagenesCargadas = await cargarImagen(imagenes);

//           if (!imagenesCargadas) {
//             throw new Error("No se pudo cargar las imagenes, rollback");
//           }

//           await prisma.imagen.createMany({
//             data: imagenesCargadas.map((imagen) => ({
//               url: imagen,
//               profesionalId: profesional.id,
//             })),
//           });
//         } else {
//           console.log("No hay imagenes");
//         }

//         return { profesional };
//       } catch (error) {
//         console.error("Error creating professional:", error);
//         throw error;
//       }
//     });

//     console.log("Professional con foto? ", transaccionPrisma.profesional);

//     return {
//       ok: true,
//       profesional: transaccionPrisma.profesional,
//     };
//   } catch (error) {
//     console.error("Error creating professional:", error);
//     return {
//       ok: false,
//       mensaje: "No se pudo crear el profesional desde backend",
//     };
//   }
// };

export const crearProfesional = async (formData: FormData) => {
  console.log("Form data:", formData);

  try {
    const trabajos = formData.getAll("trabajo").map((t) => t as string);
    const redes = formData.getAll("redes").map((r) => JSON.parse(r as string));

    const profesionalData = {
      nombre: capitalizeFirstLetter(formData.get("nombre") as string),
      apellido: capitalizeFirstLetter(formData.get("apellido") as string),
      numero: formData.get("numero") as string,
      trabajo: trabajos.map( t => capitalizeFirstLetter(t)),
    };

    console.log("Profesional data:", profesionalData);

    const redesData = redes.map((r) => ({
      url: r.url,
      tipo: r.tipo ,
    }));

    const profesionalValido = ProfesionalSchema.safeParse(profesionalData);
    console.log("Profesional válido:", profesionalValido);

    if (!profesionalValido.success) {
      console.error(
        "Error parsing professional data:",
        profesionalValido.error
      );
      return {
        ok: false,
        mensaje: profesionalValido.error.message,
      };
    }

    const { id, ...restInfo } = profesionalValido.data;
    console.log("Datos del profesional a crear:", restInfo);

    // Crear profesional
    const profesional = await prisma.profesional.create({
      data: restInfo,
    });

    console.log("Profesional creado:", profesional);

    // Crear redes sociales
    const redesSociales = await prisma.redSocial.createMany({
      data: redesData.map((r) => ({
        url: r.url,
        tipo: r.tipo,
        profesionalId: profesional.id,
      })),
    });

    console.log("Redes sociales creadas:", redesSociales);

    // Crear imágenes
    const imagenes = formData.getAll("imagen") as File[];
    console.log("Imagenes recibidas para cargar:", imagenes);
    if (imagenes.length > 0) {
      const imagenesCargadas = await cargarImagen(imagenes);

      if (!imagenesCargadas) {
        throw new Error("No se pudo cargar las imagenes, rollback");
      }

      const imagenesConUrl = imagenesCargadas.filter(
        (imagen) => imagen !== null && imagen.url !== null
      );

      await prisma.imagen.createMany({
        data: imagenesConUrl.map((imagen) => ({
          url: imagen?.url ?? '',
          profesionalId: profesional.id,
        })).filter((imagen) => imagen.url !== ''),
      });
    } else {
      console.log("No hay imagenes");
    }

    return {
      ok: true,
      profesional: profesional,
    };
  } catch (error) {
    console.error("Error creating professional:", error);
    return {
      ok: false,
      mensaje: "No se pudo crear el profesional desde backend",
    };
  }
};

const cargarImagen = async (imagenes: File[]) => {
  try {
    const cargarPromesas = imagenes.map(async (imagen) => {
      try {
        const buffer = await imagen.arrayBuffer();
        const base64Imagen = Buffer.from(buffer).toString("base64");

        const respuesta = await cloudinary.uploader.upload(
          `data:image/png;base64,${base64Imagen}`,
          {
            folder: "profesionales",
            transformation: {
              aspect_ratio: "4:3" ,
              crop: "fill"
            }
          }
        );

        return {
          url: respuesta.secure_url,
        };
      } catch (error) {
        console.log(error);
        return null;
      }
    });

    const imagenesActualizadas = await Promise.all(cargarPromesas);
    return imagenesActualizadas.filter((imagen) => imagen !== null); // Filtrar elementos nulos si es necesario
  } catch (error) {
    console.log(error);
    return null;
  }
};

// const cargarImagen = async (imagenes: File[]) => { try { const cargarPromesas = imagenes.map(async (imagen) => { try { const buffer = await imagen.arrayBuffer(); const base64Imagen = Buffer.from(buffer).toString("base64"); // Creo un string

//     return cloudinary.uploader
//       .upload(`data:image/png;base64,${base64Imagen}`)
//       .then((respuesta) => respuesta.secure_url);
//   } catch (error) {
//     console.log(error);
//     return null;
//   }
// });

// const imagenesActualizadas = await Promise.all(cargarPromesas);
// return imagenesActualizadas;
// } catch (error) { console.log(error); return null; } };
