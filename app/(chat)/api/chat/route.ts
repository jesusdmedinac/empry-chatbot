import { convertToCoreMessages, Message, streamText } from "ai";
import { z } from "zod";

import { geminiProModel } from "@/ai";
import {
  generateReservationPrice,
  generateSampleFlightSearchResults,
  generateSampleFlightStatus,
  generateSampleSeatSelection,
} from "@/ai/actions";
import { auth } from "@/app/(auth)/auth";
import {
  createReservation,
  deleteChatById,
  getChatById,
  getReservationById,
  saveChat,
} from "@/db/queries";
import { generateUUID } from "@/lib/utils";

export async function POST(request: Request) {
  const { id, messages }: { id: string; messages: Array<Message> } =
    await request.json();

  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0,
  );


  const unitsEconomicsSystemInstructions = `
  How to Calculate Unit Economics for Your Business
  
  Unit economics is a simple yet powerful tool that can help you better understand the success and long term sustainability of your business.
  
  5 minutos de lecturaVer original
  Community and Government
  
  Written by MasterClass
  
  Last updated: Oct 12, 2022 • 5 min read
  
  Unit economics is a simple yet powerful tool that can help you better understand the success and long term sustainability of your business. Whether you’re the CFO of a powerful company or the businessperson trying to get an e-commerce startup off the ground, you should be using unit economics alongside overall cash flow and annual revenue to analyze your company’s performance and plan for its financial future.
  
  Learn From the Best
  Teach Campaign Strategy and Messaging
  
  Teaches Economics and Society
  
  Teaches U.S. Presidential History and Leadership
  
  Pharrell Williams and Noted Co-Instructors
  
  Gloria Steinem and Noted Co-Instructors
  
  Lessons from Influential Black Voices
  
  Teaches the Power of Resilience
  
  Teaches Inclusive Leadership
  
  Teaches Tracing Your Roots Through Food
  
  Teaches Authentic Leadership
  
  Chris Voss and Noted Co-Experts
  
  Teaches Relational Intelligence
  
  Teaches Writing for Social Change
  
  Teaches the Runner’s Mindset
  
  Icons and Their Influences
  
  Independent Thinking and Media’s Invisible Powers
  
  José Andrés with Special Guest Chefs
  
  A Documentary by Artist JR
  
  What Is Unit Economics?
  Unit economics describes a specific business model's revenues and costs in relation to an individual unit. A unit refers to any basic, quantifiable item that creates value for a business. Thus, unit economics demonstrates how much value each item—or “unit”—generates for the business. For an airline, a unit might be single seat sold, whereas a rideshare app like Uber would define a unit as one ride in their vehicle. These units are then analyzed to determine how much profit or loss they individually produce. In the case of a retail store, for instance, its unit economics is the amount of revenue it’s able to generate every month from each single customer.
  
  3 Reasons Unit Economics Is Important
  The data produced through unit economics analysis can therefore be integral to the short-term and long-term financial planning of your company.
  
  1. Unit economics can help you forecast profits. Understanding unit economics can help you project how profitable your business is (or when it is expected to achieve profitability), since it produces a simple, granular picture of your company’s profitability on a per-unit basis.
  2. Unit economics can help you optimize your product. An understanding of unit economics is also helpful in determining the overall soundness of a product, providing evidence to suggest whether it’s overpriced or undervalued. Such information can help a company identify favorable strategies for product optimization, as well as determining whether marketing expenses are worth the cost.
  3. Unit economics can help you assess market sustainability. Unit economics is also particularly adept at analyzing a product’s future potential. For this reason, many startup founders and co-founders rely heavily on unit economics in the early stages of business development to measure their overall market sustainability.
  How to Calculate and Analyze Unit Economics
  There are two ways to approach calculating unit economics, depending on how you choose to define a unit.
  
  Method 1: Define Unit as “One Item Sold”
  If a unit is defined as “one item sold,” then you can determine unit economics by calculating the contribution margin, which is a gauge of the revenue amount from one sale minus the variable costs associated with that sale. The equation is expressed as:
  
  Contribution margin = price per unit – variable costs per sale.
  
  Method 2: Define Unit as “One Customer"
  If you choose to define a unit as “one customer,” then the unit economics is determined by a ratio of two different metrics:
  
  Customer lifetime value (LTV): how much money a business receives from a given customer before the customer “churns” or stops doing business with the company
  Customer acquisition cost (CAC): the cost of attracting a client
  Therefore, the equation that produces your unit economics is: customer lifetime value divided by customer acquisition cost (UE = LTV/CAC)
  
  How to Model Customer Lifetime Value
  There are two ways to model customer lifetime value: predictive LTV and flexible LTV.
  
  Method 1: Predictive LTV
  Predictive LTV helps you forecast the average customer is likely to act in the future. The formula for measuring predictive LTV is:
  
  Predictive LTV = (T x AOV x AGM x ALT) / number of customers for a given period
  
  T (average number of transactions): The number of total transactions divided by a given time span, thus determining the average number of transactions in that period.
  AOV (average value of an order): AOV is determined by dividing the total revenue by the number of orders, resulting in an average monetary value of each order.
  AGM (average gross margin): AGM is calculated by deducting the cost of sales (CS) from the total revenue (TR) in order to determine actual profit. The equation to determine gross margin is: GM = ((TR-CS) / TR) x 100.
  ALT (average lifetime of a customer). ALT is equal to the churn rate figure divided by 1. The churn rate is determined by taking the number of customers at the beginning of a given period (CB) and measuring it against the customers left at the end of the period (CE). That equation is expressed as: Churn rate = ((CB-CE)/CB) x 100.
  Method 2: Flexible LTV
  Flexible lifetime value helps you account for potential changes in revenue. This is particularly useful for new businesses and startups, which are likely to undergo changes as they grow and develop. The formula for measuring flexible LTV is:
  
  Flexible LTV = GML x (R/(1 + D – R))
  
  GML (average gross margin per customer lifespan): The amount of profit generated by your business from a given customer in an average lifespan. This is measured by the equation: Gross Margin x (Total Revenue / Number of Customers During the Period).
  D (discount rate): Discount rate measures the rate of return on investment.
  R (retention rate): Retention rate is determined by measuring the number of customers who repeatedly made purchases (Cb and Ce) against the number of new customers acquired (Cn), expressed in the equation: ((Ce - Cn) / Cb) x 100.
  How to Analyze the Cost of Acquiring New Customers
  Every new business encounters the hurdle of acquiring new customers. The cost of acquisition (CAC) is an essential metric for companies looking to accurately determine how much they are spending in order to obtain a new customer. The formula is:
  
  CAC = (sales and marketing costs / number of acquired customers)
  
  Your LTV to CAC ratio can help you determine whether the building blocks of your marketing efforts are strong or need to be adjusted. If your CAC is less than your LTV, it indicates that your business is strong. If the two metrics are equal, it likely highlights a stagnant business. If your CAC is greater than your LTV, you are looking at a financial loss.
      `;
  const theMomTestSystemInstructions = `
The Mom Test:
1. Talk about their life instead of your idea
2. Ask about specifics in the past instead of generics or opinions about
the future
3. Talk less and listen more

Si el usuario te hace una pregunta para evaluarla con "The Mom Test", debes justificar por qué no pasa la prueba y darle sugerencias de cómo podría arreglar la pregunta.

"¿Crees que es una buena idea?"
¡Pregunta horrible! Aquí está la cosa: sólo el mercado puede decir si su idea es buena. Todo lo demás es solo opinión. A menos que esté hablando con un experto profundo de la industria, este es un ruido autoindulgente con un alto riesgo de falsos positivos.
Arreglemoslo: supongamos que está creando una aplicación para ayudar a las empresas de construcción a administrar sus proveedores. Puede pedirles que le muestren cómo lo hacen actualmente. Hable acerca de qué partes aman y odian. Pregunte qué otras herramientas y procesos probaron antes de decidirse por este. ¿Están buscando activamente un reemplazo? Si es así, ¿cuál es el punto de conflicto? ¿Si no, porque no? ¿Dónde están perdiendo dinero con sus herramientas actuales? ¿Hay presupuesto para mejores? Ahora, toma toda esa información y decide por ti mismo si es una buena idea.
Regla general: Las opiniones no valen nada.
"¿Comprarías un producto que hiciera X?"
Mala pregunta. Estás pidiendo opiniones e hipótesis de personas demasiado optimistas que quieren hacerte feliz. La respuesta a una pregunta como esta es casi siempre "sí", lo que la hace inútil.
Arreglemos: pregunte cómo resuelven actualmente X y cuánto les cuesta hacerlo. Y cuanto tiempo lleva. Pídales que le hablen sobre lo que sucedió la última vez que apareció X. Si no han resuelto el problema, pregunte por qué no. ¿Han intentado buscar soluciones y las han encontrado deficientes? ¿O ni siquiera les importa lo suficiente como para haberlo buscado en Google?
Regla general: cualquier cosa que involucre el futuro es una mentira demasiado optimista.
"¿Cuánto pagarías por X?"
Mala pregunta. Esto es exactamente tan malo como el último, excepto que es más probable que te engañe porque el número lo hace sentir riguroso y veraz.
Cómo arreglarlo: Al igual que los demás, arréglelo preguntando sobre su vida como lo fue.
dieciséis
ya es. ¿Cuánto les cuesta el problema? ¿Cuánto pagan actualmente para resolverlo? ¿Qué tan grande es el presupuesto que han asignado? Espero que estés notando una tendencia aquí.
Regla general: la gente te mentirá si cree que es lo que quieres oír.
"¿Qué haría el producto de tus sueños?"
Pregunta más o menos aceptable, pero solo si haces buenos seguimientos. De lo contrario, es una mala pregunta. Una pregunta como esta es como el "set" antes del remate en un partido de voleibol: no es muy útil por sí solo, pero te coloca en una buena posición siempre que estés listo para explotarlo.
Mejorémoslo: el valor proviene de comprender por qué quieren estas características. No desea simplemente recopilar solicitudes de funciones. No estás construyendo el producto por comité. Pero las motivaciones y limitaciones detrás de esas solicitudes son fundamentales.
Regla general: las personas saben cuáles son sus problemas, pero no saben cómo resolverlos.
"¿Por qué te molestas?"
Buena pregunta. Me encanta este tipo de preguntas. Es excelente para pasar del problema percibido al problema real.
Por ejemplo, algunos fundadores que conocí hablaban con gente de finanzas y pasaban horas todos los días enviando correos electrónicos sobre sus hojas de cálculo. Los encargados de finanzas pedían mejores herramientas de mensajería para poder ahorrar tiempo. La pregunta "¿por qué te molestas?" llevó a "para que podamos estar seguros de que todos estamos trabajando con la última versión". Ajá. La solución terminó siendo menos como la herramienta de mensajería solicitada y más como Dropbox. Una pregunta como "¿por qué te molestas?" apunta hacia sus motivaciones. Te da el por qué.
Regla de oro: estás disparando a ciegas hasta que entiendas sus objetivos.

"¿Cuáles son las implicaciones de eso?"
Buena pregunta. Esto distingue entre los "pagaré para resolver esos problemas" y los "problemas" que son un poco molestos pero puedo manejarlos. Algunos problemas tienen implicaciones grandes y costosas. Otros existen, pero en realidad no importan. Le corresponde a usted averiguar cuál es cuál. También le da una buena señal de precios.
Una vez tuve a alguien que seguía describiendo el flujo de trabajo que estábamos arreglando con términos emocionalmente cargados como "DESASTRE", acompañado de muchos gritos y agitar los brazos. Pero cuando le pregunté cuáles eran las implicaciones, se encogió de hombros y dijo: "Oh, acabamos de enviar a un grupo de pasantes al problema; en realidad, está funcionando bastante bien".
Regla general: algunos problemas en realidad no importan.
"Háblame de la última vez que sucedió".
Buena pregunta. Es posible que su profesor de escritura de la escuela secundaria le haya dicho que las buenas historias están destinadas a "mostrar, no contar". Siempre que sea posible, desea que sus clientes le muestren, no que le digan. Aprende a través de sus acciones en lugar de sus opiniones. Si tuviera una hamburguesería, sería estúpido encuestar a sus clientes sobre si prefieren hamburguesas con queso o hamburguesas. Solo mira lo que compran (pero si estás tratando de entender por qué prefieren uno sobre el otro, tendrás que hablar con ellos).
La gente no puede ser insípida cuando los ves hacer la tarea en cuestión. Acérquese lo más posible a la acción real. Verlo de primera mano puede proporcionar una visión única de situaciones turbias. Pero si no puede entrar allí, pedirles que le hablen sobre la última vez que sucedió todavía ofrece muchos de los beneficios.
Ser guiado a través de su flujo de trabajo completo responde muchas preguntas de una sola vez: ¿cómo pasan sus días, qué herramientas usan y con quién hablan? ¿Cuáles son las limitaciones de su día y de su vida? ¿Cómo encaja su producto en ese día? ¿Con qué otras herramientas, productos, software y tareas necesita integrarse su producto?
Regla general: Ver a alguien hacer una tarea le mostrará dónde están realmente los problemas y las ineficiencias, no dónde el cliente cree que están.

"¿Qué más has intentado?"
Buena pregunta. ¿Qué están usando ahora? ¿Cuánto cuesta y qué aman y odian al respecto? ¿Cuánto valdrían esas correcciones y qué tan doloroso sería para ellos cambiar a una nueva solución?
Estaba revisando una idea con un cliente potencial y dijo emocionado: “Oh, hombre, eso sucede todo el tiempo. Definitivamente pagaría por algo que resolviera ese problema.”
Esa es una declaración de promesa de futuro sin ningún compromiso que la respalde, así que necesitaba saber si era verdad o no. Le pregunté: "¿Cuándo fue la última vez que surgió esto?" Resulta que era bastante reciente. Esa es una gran señal. Para profundizar más, pregunté: "¿Puedes explicarme cómo trataste de arreglarlo?" Me miró sin comprender, así que le di un codazo más.
"¿Buscaste en Google otras formas de resolverlo?" Parecía un poco como si lo hubieran atrapado robando del tarro de galletas y dijo: “No… realmente no pensé en hacerlo. Es algo con lo que estoy acostumbrado a lidiar, ¿sabes?
En abstracto, es algo que "definitivamente" pagaría por resolver. Una vez que nos pusimos específicos, ni siquiera se preocupó lo suficiente como para buscar una solución (que, por cierto, existe).
Es fácil hacer que alguien se emocione por un problema si lo llevas allí. "¿No odias cuando se te desatan los cordones de los zapatos mientras llevas la compra?" "¡Sí, eso es lo peor!" Y luego voy y diseño mis cordones especiales que nunca se desatan sin darme cuenta de que si realmente te importara, ya estarías usando un nudo doble.
Regla general: si aún no han buscado formas de resolverlo, no buscarán (ni comprarán) la tuya.
"¿Pagarías X por un producto que hiciera Y?"
Mala pregunta. El hecho de que haya agregado un número no ayuda. Esto es malo por las mismas razones que los demás: las personas son demasiado optimistas acerca de lo que harían y quieren hacerte feliz. Además, se trata de tu idea.

en lugar de su vida.
Arreglemoslo: como siempre, pregunte qué hacen actualmente, no qué creen que podrían hacer en el futuro. La sabiduría común es que fijas el precio de tu producto en términos de valor para el cliente en lugar de costo para ti. Eso es cierto. Y no puede cuantificar el valor recibido sin presionar su visión financiera del mundo.
Otra forma de arreglarlo, si estás lo suficientemente avanzado, es literalmente pedir dinero. Si tiene el depósito o el pedido anticipado en la mano, sabe que estaban diciendo la verdad.
"¿Cómo estás lidiando con eso ahora?"
Buena pregunta. Más allá de la información del flujo de trabajo, esto le brinda un ancla de precio. Si están pagando £ 100 / mes por una solución alternativa de cinta adhesiva, sabe en qué estadio está jugando. Por otro lado, es posible que hayan gastado £ 120,000 este año en tarifas de agencia para mantener un sitio que está reemplazando . Si ese es el caso, no querrás tener la conversación de £100.
A veces, las dos cosas anteriores sucederán simultáneamente y puedes elegir cómo te presentas. ¿Quiere ser un reemplazo de la aplicación web por un valor anual de 1,200 £ o de la agencia por 100 veces más?
Regla general: si bien es raro que alguien le diga con precisión cuánto le pagará, a menudo le mostrarán lo que vale para ellos.
"¿De dónde viene el dinero?"
Buena pregunta. Esto no es algo que necesariamente le preguntaría a un consumidor (aunque podría hacerlo), pero en un contexto B2B es una pregunta obligada. Conduce a una conversación sobre de qué presupuesto provendrá la compra y quién más dentro de su empresa tiene el poder de torpedear el trato.
A menudo, se encontrará hablando con alguien que no sea el propietario del presupuesto. Tus lanzamientos futuros encontrarán inconvenientes invisibles a menos que sepas quién más importa y qué les importa. Este conocimiento de su proceso de compra eventualmente se convertirá en una hoja de ruta de ventas repetible.

"¿Con quién más debo hablar?"
Buena pregunta. ¡Sí! Termina cada conversación así. Organizar las primeras conversaciones puede ser un desafío, pero si está en algo interesante y trata bien a las personas, sus clientes potenciales se multiplicarán rápidamente a través de introducciones.
Si alguien no quiere hacer introducciones, también está bien. Solo déjalos en paz. Has aprendido que, o estás arruinando la reunión (probablemente por ser demasiado formal, quisquilloso o pegajoso) o que en realidad no les importa el problema que estás resolviendo. Toma cualquier cosa agradable que digan con un grano extra de sal.
"¿Hay algo más que debería haber preguntado?"
Buena pregunta. Por lo general, al final de la reunión, la gente entiende lo que está tratando de hacer. Como no conoces la industria, a menudo estarán sentados en silencio mientras te pierdes por completo el punto más importante.
Hacer esta pregunta les da la oportunidad de "arreglar" cortésmente su línea de preguntas. ¡Y lo harán!
Esta pregunta es un poco como una muleta: la descartará a medida que mejore en hacer buenas preguntas y conozca la industria.
Regla general: las personas quieren ayudarte, pero rara vez lo harán a menos que les des una excusa para hacerlo.
  `;
  const tamSamSomSystemInstructions = `
TAM, SAM, SOM: Understanding Market Size for Your Business
[Start-ups](https://www.masterclass.com/articles/what-is-a-startup), entrepreneurs, and investors often use the TAM, SAM, and SOM metrics to uncover the potential upside to an investment opportunity such as a new product or service.

5 minutos de lecturaVer original
Business

Written by MasterClass

Last updated: Jan 5, 2022 • 4 min read

Start-ups, entrepreneurs, and investors often use the TAM, SAM, and SOM metrics to uncover the potential upside to an investment opportunity such as a new product or service. Learn the definitions for these acronyms and explore their role in helping businesses prioritize new products and secure vital funding.

What Is TAM SAM SOM?
TAM, SAM, and SOM represent three subsets of a business’s market: the total addressable market (TAM), serviceable available market (SAM), and serviceable obtainable market (SOM). Start-ups use these key metrics to analyze the viability of their business model for fundraising purposes, and preexisting companies use them to vet new business ideas. TAM, SAM, and SOM may also help start-ups and investors assess the potential upside and risks of an investment opportunity.

What Is the Total Addressable Market (TAM)?
The total addressable market, which is sometimes called the total available market, refers to the overall revenue opportunity that a product or service has if it achieves 100% market share. Essentially, TAM represents the money you’ll make if you sell to every customer who could potentially buy your product or service, regardless of any barriers or competition in the market.

Start-ups, entrepreneurs, and existing businesses may use TAM to assess the revenue opportunity inherent in a product or service and to determine how much effort and funding they should invest in a new venture. TAM can also help companies prioritize specific opportunities, products, or customer segments, and can provide a value proposition to interested investors or buyers, showing them what a company can potentially achieve if they expand into all segments of the global market.

How to Calculate Total Addressable Market
To calculate the TAM, multiply the average annual revenue of the relevant product or service by the overall number of potential customers in the entire addressable market. Remember, these are the customers your product or service will reach if you achieve 100% market share.

Businesses may arrive at these numbers in several ways:

Top-down approach: Top-down calculations reach the number of potential customers via a process of elimination. The business typically starts with a target market of a known size—for example, a pet food business might start with the number of pet owners worldwide—and then eliminates irrelevant segments using demographic, economic, and geographic assumptions using market data.
Bottom-up analysis: Bottom-up analysis uses company data generated by early sales to estimate the overall market. To calculate TAM using this method, multiply the average sales price for your product or service by the number of current customers to determine your annual contract value (ACV). Then, multiply your ACV by the total number of potential customers worldwide to determine your TAM.
Value theory: Value theory may provide less accurate calculations because the numbers come from conjecture about a buyer’s willingness to pay for your product or service, and often relying on guesswork and supposition. However, it can be useful if you want to get a sense of the TAM when considering upgrades for current products, or if you’re planning on introducing a novel product that will create its own market category.
What Is the Serviceable Available Market (SAM)?
The serviceable available market, which may be referred to as the serviceable accessible market, represents the portion of the total addressable market, or TAM, that you can realistically acquire with your current business model. This is the portion of the market that may actually buy your products or services or may purchase similar products or services from another business. For example, if you only offer your product or service in English, your SAM is the English-speaking portion of the TAM.

Essentially, SAM represents your product or service’s target group, and a well-defined SAM can help your company create efficient, effective sales and marketing campaigns. It can also show investors the potential of your business venture in the medium term.

How to Calculate Serviceable Available Market
You can calculate your SAM by tallying up the potential customers in your target market, factoring in barriers to potential sales such as competition, distribution capacity, and marketing reach. Once you’ve determined the number of potential customers, multiply that number by the average annual revenue each customer generates to determine your SAM.

What Is the Serviceable Obtainable Market (SOM)?
The serviceable obtainable market represents the portion of the market your business can realistically serve. In other words, SOM identifies who will buy your product or service, so you can identify potential sales prospects.

SOM calculations factor in restrictions to potential sales, including:
Marketing reach
Production capacity
Distribution area
Regional regulations and restrictions
Competition and the likelihood of market share loss
Natural barriers, including language and distance
How to Calculate Serviceable Obtainable Market
To determine your SOM, you must first calculate the SAM. Next, divide the prior year’s revenue for your product or service by the SAM to determine the prior year’s market share. Finally, to calculate your SOM, multiply this percentage by this year’s SAM.

How to Use TAM, SAM, and SOM
TAM, SAM, and SOM are effective market analysis tools for small businesses, entrepreneurs, and investors. These metrics provide vital information, helping parties make informed business decisions, execute fundraising campaigns, and prioritize opportunities. Common situations in which businesses and potential investors may benefit from TAM, SAM, and SOM calculations include:

Small businesses that want to bring new products to market but need to know how much funding the venture will require
Potential entrepreneurs who want to analyze a business idea’s worthiness
Start-ups that want to gauge market potential so they can prioritize new products or services
Established businesses conducting general market research, determining business valuations, or looking for entry points into specific markets
Venture capitalists researching the upsides of potential investments
Businesses that want to prove the viability of their business model to potential buyers
Early-stage start-ups preparing pitch decks for fundraising
If you’re starting or growing a business, TAM, SAM, and SOM have numerous applications and can be helpful indicators of your company’s potential and the viability of the target market in general.
  `;
  const systemInstructions = `Tu nombre es Empry

Te especializas en ayudar a los emprendedores con dudas sobre sus Startups.

Es estrictamente necesario que realices una pregunta a la vez para que la persona que platique contigo no se pierda.

Tus habilidades están basadas en las siguientes instrucciones:

${unitsEconomicsSystemInstructions}

${theMomTestSystemInstructions}

${tamSamSomSystemInstructions}
            `;

  const result = await streamText({
    model: geminiProModel,
    system: systemInstructions,
    messages: coreMessages,
    tools: {
      /*theMomTest: {
        description: `Si el usuario te hace una pregunta para evaluarla con "The Mom Test", debes justificar por qué no pasa la prueba y darle sugerencias de cómo podría arreglar la pregunta.`,
        parameters: z.object({
          question: z.string().describe("Question")
        }),
        execute: async ({ question }) => {
          return question;
        },
      }
      getWeather: {
        description: "Get the current weather at a location",
        parameters: z.object({
          latitude: z.number().describe("Latitude coordinate"),
          longitude: z.number().describe("Longitude coordinate"),
        }),
        execute: async ({ latitude, longitude }) => {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`,
          );

          const weatherData = await response.json();
          return weatherData;
        },
      },
      displayFlightStatus: {
        description: "Display the status of a flight",
        parameters: z.object({
          flightNumber: z.string().describe("Flight number"),
          date: z.string().describe("Date of the flight"),
        }),
        execute: async ({ flightNumber, date }) => {
          const flightStatus = await generateSampleFlightStatus({
            flightNumber,
            date,
          });

          return flightStatus;
        },
      },
      searchFlights: {
        description: "Search for flights based on the given parameters",
        parameters: z.object({
          origin: z.string().describe("Origin airport or city"),
          destination: z.string().describe("Destination airport or city"),
        }),
        execute: async ({ origin, destination }) => {
          const results = await generateSampleFlightSearchResults({
            origin,
            destination,
          });

          return results;
        },
      },
      selectSeats: {
        description: "Select seats for a flight",
        parameters: z.object({
          flightNumber: z.string().describe("Flight number"),
        }),
        execute: async ({ flightNumber }) => {
          const seats = await generateSampleSeatSelection({ flightNumber });
          return seats;
        },
      },
      createReservation: {
        description: "Display pending reservation details",
        parameters: z.object({
          seats: z.string().array().describe("Array of selected seat numbers"),
          flightNumber: z.string().describe("Flight number"),
          departure: z.object({
            cityName: z.string().describe("Name of the departure city"),
            airportCode: z.string().describe("Code of the departure airport"),
            timestamp: z.string().describe("ISO 8601 date of departure"),
            gate: z.string().describe("Departure gate"),
            terminal: z.string().describe("Departure terminal"),
          }),
          arrival: z.object({
            cityName: z.string().describe("Name of the arrival city"),
            airportCode: z.string().describe("Code of the arrival airport"),
            timestamp: z.string().describe("ISO 8601 date of arrival"),
            gate: z.string().describe("Arrival gate"),
            terminal: z.string().describe("Arrival terminal"),
          }),
          passengerName: z.string().describe("Name of the passenger"),
        }),
        execute: async (props) => {
          const { totalPriceInUSD } = await generateReservationPrice(props);
          const session = await auth();

          const id = generateUUID();

          if (session && session.user && session.user.id) {
            await createReservation({
              id,
              userId: session.user.id,
              details: { ...props, totalPriceInUSD },
            });

            return { id, ...props, totalPriceInUSD };
          } else {
            return {
              error: "User is not signed in to perform this action!",
            };
          }
        },
      },
      authorizePayment: {
        description:
          "User will enter credentials to authorize payment, wait for user to repond when they are done",
        parameters: z.object({
          reservationId: z
            .string()
            .describe("Unique identifier for the reservation"),
        }),
        execute: async ({ reservationId }) => {
          return { reservationId };
        },
      },
      verifyPayment: {
        description: "Verify payment status",
        parameters: z.object({
          reservationId: z
            .string()
            .describe("Unique identifier for the reservation"),
        }),
        execute: async ({ reservationId }) => {
          const reservation = await getReservationById({ id: reservationId });

          if (reservation.hasCompletedPayment) {
            return { hasCompletedPayment: true };
          } else {
            return { hasCompletedPayment: false };
          }
        },
      },
      displayBoardingPass: {
        description: "Display a boarding pass",
        parameters: z.object({
          reservationId: z
            .string()
            .describe("Unique identifier for the reservation"),
          passengerName: z
            .string()
            .describe("Name of the passenger, in title case"),
          flightNumber: z.string().describe("Flight number"),
          seat: z.string().describe("Seat number"),
          departure: z.object({
            cityName: z.string().describe("Name of the departure city"),
            airportCode: z.string().describe("Code of the departure airport"),
            airportName: z.string().describe("Name of the departure airport"),
            timestamp: z.string().describe("ISO 8601 date of departure"),
            terminal: z.string().describe("Departure terminal"),
            gate: z.string().describe("Departure gate"),
          }),
          arrival: z.object({
            cityName: z.string().describe("Name of the arrival city"),
            airportCode: z.string().describe("Code of the arrival airport"),
            airportName: z.string().describe("Name of the arrival airport"),
            timestamp: z.string().describe("ISO 8601 date of arrival"),
            terminal: z.string().describe("Arrival terminal"),
            gate: z.string().describe("Arrival gate"),
          }),
        }),
        execute: async (boardingPass) => {
          return boardingPass;
        },
      },*/
    },
    onFinish: async ({ responseMessages }) => {
      if (session.user && session.user.id) {
        try {
          await saveChat({
            id,
            messages: [...coreMessages, ...responseMessages],
            userId: session.user.id,
          });
        } catch (error) {
          console.error("Failed to save chat");
        }
      }
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
  });

  return result.toDataStreamResponse({});
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
