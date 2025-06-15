# RuralControl

## Descripción

Este proyecto consiste en una aplicación web, en la que los propietarios de casas rurales podrán gestionar las casas rurales que tienen y los usuarios podrán encontrar casas rurales para alquilarlas de vacaciones.

## Tecnologías y estructura

El backend estará hecho en **Laravel**, con **Sanctum** para poder autenticar a los usuarios, y el frontend estará hecho en **Angular**.

Mi idea de estructura para el proyecto será por ahora, tener dos apis separadas en lugar de una estructura monolítica. Para ello, debería tener:

-Una api para los usuarios.

- Una api para las reservas, casas, etc.

Cada **API** y se comunicarían por **HTTP** entre ellos. Desde el frontend en Angular, se tendrían que consumir estas dos APIs por separado.  
Esto permitiría:

1. Conectar las Apis por separado.
2. Probar con una arquitectura diferente, ya que hasta ahora todas las aplicaciones han sido monolíticas con un solo backend.

# Despliegue

Para desplegar el proyecto, tienes que descargarlo del respositorio, como el backend esta preparado solo tendras que ejecutar el comando sudo docker-compose up --build y asi arrancaras todo el Backend a la vez. Para el frontend, ademas de hacer el npm install, deberas ejecutar ng serve y todo listo para disfrutar de la aplicacion

# Casos de uso

![alt text](Docs/Diagrama_casos_de_uso.png)

# Vistas/Pantallas

## Vistas del cliente

![alt text](Docs/Imagenes/1.png)

### Todas las casa que hay disponibles

![alt text](Docs/Imagenes/Listado_Casas.png)

### Formulario para hacer la reserva

![](Docs/Imagenes/Form_Reserva.png)

### Ver la casa y sus caracteristicas

![alt text](Docs/Imagenes/Cliente_Casa.png)

### Historial de reservas que ha hecho el cliente

![alt text](Docs/Imagenes/ReservasCliente.png)

## Vista Administrador

![alt text](Docs/Imagenes/6.png)

### Pantalla de inicio del Admin, aqui aparecera un dashboard con graficas sobre las reservas el dinero total que ha conseguido, etc.

![alt text](Docs/Imagenes/Daashboard.png)

### Las casas que tiene un administrador paraa gestionar

![alt text](Docs/Imagenes/CasasAdmin.png)

### Formulario Para añadir una nueva casa

![alt text](Docs/Imagenes/Form_Casa.png)

### Ver la casa y las reservas que ha tenido

![alt text](Docs/Imagenes/Admin_Casa.png)
