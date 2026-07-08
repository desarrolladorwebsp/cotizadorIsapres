import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad y Protección de Datos Personales",
  description:
    "Conoce cómo Cotizador Premium trata tus datos personales conforme a la Ley chilena N° 21.719 sobre protección de datos personales.",
};

export default function PoliticaPrivacidadPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <header className="mb-8 space-y-3 sm:mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary sm:text-[13px]">
          Política de Privacidad
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Política de Privacidad y Protección de Datos Personales
        </h1>
        <p className="max-w-2xl text-sm text-muted sm:text-base">
          En Cotizador Premium nos comprometemos a proteger tus datos personales y a tratarlos
          conforme a la Ley chilena N° 21.719 sobre protección de datos personales, resguardando tu
          privacidad y tus derechos.
        </p>
      </header>

      <div className="space-y-8 text-sm leading-relaxed text-muted sm:text-[15px]">
        <section aria-labelledby="pp-ambito">
          <h2
            id="pp-ambito"
            className="mb-2 text-base font-semibold tracking-tight text-foreground sm:text-lg"
          >
            1. Ámbito de aplicación
          </h2>
          <p>
            Esta política aplica al tratamiento de datos personales realizado por Cotizador Premium
            a través del sitio web <span className="font-medium">cotizadorpremium.cl</span> y sus
            herramientas asociadas de cotización, contacto y gestión de clientes.
          </p>
          <p className="mt-2">
            Se entiende por <span className="font-medium">dato personal</span> cualquier
            información que identifique o pueda identificar a una persona natural, de acuerdo con la
            Ley N° 21.719.
          </p>
        </section>

        <section aria-labelledby="pp-responsable">
          <h2
            id="pp-responsable"
            className="mb-2 text-base font-semibold tracking-tight text-foreground sm:text-lg"
          >
            2. Responsable del tratamiento
          </h2>
          <p>
            El responsable del tratamiento de tus datos personales es{" "}
            <span className="font-medium">Cotizador Premium</span>, quien determina las finalidades
            y medios del tratamiento.
          </p>
          <p className="mt-2">
            Puedes comunicarte con nosotros a través del correo{" "}
            <span className="font-medium">contacto@cotizadorpremium.cl</span> o mediante nuestro
            canal oficial de WhatsApp publicado en este sitio.
          </p>
        </section>

        <section aria-labelledby="pp-datos">
          <h2
            id="pp-datos"
            className="mb-2 text-base font-semibold tracking-tight text-foreground sm:text-lg"
          >
            3. Datos que tratamos
          </h2>
          <p>Dependiendo de cómo interactúes con el sitio, podemos tratar las siguientes categorías de datos:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Datos de contacto: nombre, RUT, correo electrónico, teléfono y comuna o región.</li>
            <li>
              Datos asociados a la cotización: información sobre tu situación previsional, rango de
              ingresos, preferencia de planes y otras variables necesarias para mostrar opciones de
              planes de salud.
            </li>
            <li>
              Datos de uso del sitio: información técnica y analítica recolectada mediante cookies o
              tecnologías similares, para fines de seguridad y mejora del servicio.
            </li>
          </ul>
        </section>

        <section aria-labelledby="pp-finalidades">
          <h2
            id="pp-finalidades"
            className="mb-2 text-base font-semibold tracking-tight text-foreground sm:text-lg"
          >
            4. Finalidades del tratamiento
          </h2>
          <p>Tratamos tus datos personales únicamente para las siguientes finalidades:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Permitir el uso del cotizador y mostrar planes de salud acordes a tu perfil.</li>
            <li>Gestionar tus solicitudes de contacto y asesoría personalizada.</li>
            <li>
              Enviar información relacionada con tu cotización, seguimiento comercial y
              recordatorios asociados.
            </li>
            <li>
              Cumplir obligaciones legales, regulatorias y de resguardo de información, según la
              normativa vigente.
            </li>
            <li>
              Mejorar la seguridad, calidad y experiencia de uso de nuestro sitio, mediante análisis
              estadístico no individualizado.
            </li>
          </ul>
        </section>

        <section aria-labelledby="pp-base-legal">
          <h2
            id="pp-base-legal"
            className="mb-2 text-base font-semibold tracking-tight text-foreground sm:text-lg"
          >
            5. Base legal y consentimiento
          </h2>
          <p>
            El tratamiento de tus datos se realiza principalmente sobre la base de tu{" "}
            <span className="font-medium">consentimiento</span>, que otorgas al enviarnos
            voluntariamente tu información en los formularios del sitio o al usar el cotizador.
          </p>
          <p className="mt-2">
            En otros casos, podremos tratar datos cuando exista una{" "}
            <span className="font-medium">obligación legal</span> aplicable o cuando sea necesario
            para la ejecución de medidas precontractuales vinculadas a la contratación de un plan
            de salud.
          </p>
        </section>

        <section aria-labelledby="pp-derechos">
          <h2
            id="pp-derechos"
            className="mb-2 text-base font-semibold tracking-tight text-foreground sm:text-lg"
          >
            6. Derechos de las personas titulares de datos
          </h2>
          <p>
            De acuerdo con la Ley N° 21.719, como titular de datos personales tienes, entre otros,
            los siguientes derechos:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Acceder a tus datos personales y conocer cómo se están tratando.</li>
            <li>Solicitar la rectificación o actualización de datos inexactos o incompletos.</li>
            <li>Solicitar la eliminación de tus datos cuando ya no sean necesarios o retires tu consentimiento.</li>
            <li>Oponerte a determinados tratamientos, en los casos que establece la ley.</li>
            <li>Solicitar la portabilidad de tus datos, cuando corresponda.</li>
          </ul>
          <p className="mt-2">
            Para ejercer estos derechos puedes escribirnos a{" "}
            <span className="font-medium">contacto@cotizadorpremium.cl</span> indicando tu nombre,
            RUT y el derecho que deseas ejercer. Responderemos dentro de los plazos legales
            aplicables.
          </p>
        </section>

        <section aria-labelledby="pp-destinatarios">
          <h2
            id="pp-destinatarios"
            className="mb-2 text-base font-semibold tracking-tight text-foreground sm:text-lg"
          >
            7. Comunicaciones y encargados de tratamiento
          </h2>
          <p>
            Tus datos personales podrán ser comunicados a prestadores de servicios que actúen como{" "}
            <span className="font-medium">encargados de tratamiento</span>, tales como proveedores
            de infraestructura tecnológica, herramientas de envío de correos electrónicos, metabase
            y sistemas de gestión interna, siempre bajo contratos que resguarden la
            confidencialidad, seguridad y las instrucciones de Cotizador Premium.
          </p>
          <p className="mt-2">
            Podremos compartir información con aseguradoras o instituciones de salud previsional
            solo cuando sea necesario para gestionar tu cotización o contratación y conforme a tu
            consentimiento.
          </p>
        </section>

        <section aria-labelledby="pp-conservacion">
          <h2
            id="pp-conservacion"
            className="mb-2 text-base font-semibold tracking-tight text-foreground sm:text-lg"
          >
            8. Plazo de conservación
          </h2>
          <p>
            Conservaremos tus datos personales únicamente durante el tiempo necesario para cumplir
            las finalidades descritas en esta política y los plazos que exija la normativa aplicable
            (por ejemplo, deberes de información, respaldo comercial o contable).
          </p>
          <p className="mt-2">
            Una vez vencidos dichos plazos, tus datos serán eliminados, anonimizados o bloqueados de
            forma segura.
          </p>
        </section>

        <section aria-labelledby="pp-seguridad">
          <h2
            id="pp-seguridad"
            className="mb-2 text-base font-semibold tracking-tight text-foreground sm:text-lg"
          >
            9. Medidas de seguridad
          </h2>
          <p>
            Implementamos medidas técnicas y organizativas razonables para proteger tus datos
            personales frente a accesos no autorizados, pérdida, alteración o divulgación indebida,
            en línea con los principios de seguridad y responsabilidad establecidos por la Ley
            N° 21.719.
          </p>
        </section>

        <section aria-labelledby="pp-actualizaciones">
          <h2
            id="pp-actualizaciones"
            className="mb-2 text-base font-semibold tracking-tight text-foreground sm:text-lg"
          >
            10. Actualizaciones de esta política
          </h2>
          <p>
            Podremos actualizar esta política para reflejar cambios normativos, operativos o en los
            servicios ofrecidos. Cuando exista una modificación relevante, lo informaremos por los
            canales habituales del sitio.
          </p>
          <p className="mt-2">
            Te recomendamos revisar periódicamente esta página para mantenerte informado sobre cómo
            protegemos tus datos personales.
          </p>
        </section>
      </div>
    </main>
  );
}

