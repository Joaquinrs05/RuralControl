# RuralControl

## Descripción
Este proyecto consiste en una aplicación web, en la que los propietarios de casas rurales podrán gestionar las casas rurales que tienen y los usuarios podrán encontrar casas rurales para alquilarlas de vacaciones.

## Tecnologías y estructura

El backend estará hecho en **Laravel**, con **Sanctum** para poder autenticar a los usuarios, y el frontend estará hecho en **Angular**.

Mi idea de estructura para el proyecto será en **pequeños microservicios** en lugar de una estructura monolítica. Para ello, debería tener:
- **Un microservicio para los usuarios**.
- **Un microservicio para las casas rurales y las reservas**.  

Cada microservicio tendría su propia **API** y se comunicarían por **HTTP** entre ellos. Desde el frontend en Angular, se tendrían que consumir estas dos APIs por separado.  
Esto permitiría:
1. Si un backend se cae, la aplicación puede seguir funcionando y no se cae toda la aplicacion.
2. Conectar los microservicios por separado.
3. Probar con una arquitectura diferente, ya que hasta ahora todas las aplicaciones han sido monolíticas.

# Casos de uso
![alt text](Diagrama_casos_de_uso.png)

# Vistas/Pantallas
## Vistas del cliente
![alt text](Imagenes/1.png)
Todas las casa que hay disponibles
![alt text](Imagenes/Listado_Casas.png)
Formulario para hacer la reserva
![](Imagenes/Form_Reserva.png)
Ver la casa y sus caracteristicas
![alt text](Imagenes/Cliente_Casa.png)
Historial de reservas que ha hecho el cliente
![alt text](Imagenes/ReservasCliente.png)

## Vista Administrador
![alt text](Imagenes/6.png)
Pantalla de inicio del Admin, aqui aparecera un dashboard con graficas sobre las reservas el dinero total que ha conseguido, etc.
![alt text](Imagenes/Daashboard.png)

Las casas que tiene un administrador paraa gestionar
![alt text](Imagenes/CasasAdmin.png)

Formulario Para añadir una nueva casa
![alt text](Imagenes/Form_Casa.png)

Ver la casa y las reservas que ha tenido
![alt text](Imagenes/Admin_Casa.png)