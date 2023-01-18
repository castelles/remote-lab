# **Remote-Lab back-end**
Back-end of Remote-Lab project.

- [Introduction](#introduction)
- [Filtering](#filtering)
- [Projection](#projection)
- [Data Dependence: Updating / Removal](#data-dependence--updating---removal)
- [Device Models](#device-models)
- [REST API Features](#rest-api-features)
  * [Auth](#auth)
    + [Login](#login)
    + [Logout](#logout)
    + [Check Auth](#check-auth)
  * [User](#user)
    + [Create](#create)
    + [Show all](#show-all)
    + [Get by ID](#get-by-id)
    + [Get by Session](#get-by-session)
    + [Update](#update)
    + [Delete](#delete)
  * [PLC Version](#plc-version)
    + [Create](#create-1)
    + [Get Many](#get-many)
    + [Get One](#get-one)
    + [Update Many](#update-many)
    + [Update One](#update-one)
    + [Delete Many](#delete-many)
    + [Delete One](#delete-one)
  * [PLC](#plc)
    + [Create](#create-2)
    + [Get Many](#get-many-1)
    + [Get One](#get-one-1)
    + [Update Many](#update-many-1)
    + [Update One](#update-one-1)
    + [Delete Many](#delete-many-1)
    + [Delete One](#delete-one-1)
    + [Add Device](#add-device)
    + [Delete Devices](#delete-devices)

## Introduction

This is the back-end for the project **Remote-Lab**. The project seeks to provide a WEB tool to teach automation and PLC programming with Ladder. Arduino is being used to run Ladder diagrams, as a low-cost emulated PLC.

The back-end provides a HTTP server for [WebSocket](#https://en.wikipedia.org/wiki/WebSocket#:~:text=WebSocket%20is%20a%20computer%20communications,WebSocket%20is%20distinct%20from%20HTTP.) connections and a HTTPS server for a RESTful web API, made with express.

All requests, on all routes and methods, work with [JSON](https://www.json.org/json-en.html) data and return semantic [HTTP status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status).

The API features can be accessed by specific Routes and HTTP methods. Depending on the feature, it's possible (or required) to send data by the `query string` for filtering, or by the `body`. This information will be in the description of each API feature [below](#rest-api-features).

If the feature description does not mention the optional or mandatory submission of certain data (e.g. query string, body), then that specific feature does not support it and will ignore it if submitted.

## Filtering

In some requests, it's possible to send filtering data to select a specific resource, like in `GET`, `PUT`, and ` DELETE` requests, to point out some specific piece of data to handle.

This is done by sending pairs of **\<field\>**:**\<value\>** in the request's query string. These pairs can filter the database to interact only with the data where **\<field\>** matches with the **\<value\>**.

If the API feature requires a filter to interact with only one piece of data, and there's more than one match for the filter, the API will interact with the first match. Generally, the first match occurs with the oldest data.

## Projection

In some `GET` requests it's possible to set a projection of which data the server should return in the response.

This is done by sending the pair **projection**:**\<value\>** in the request's query string. The **\<value\>** must be a `string` with the field names to be returned, separated by space (`' '`).

If the required field is inside a nested object, [dot notation](https://docs.mongodb.com/manual/core/document/#dot-notation) must be used.

If no projection is provided, the API will return the data with all fields.

## Data Dependence: Updating / Removal

Some data (**child**) in the database may depend on other data (**parent**), e.g. PLCs, which are dependent on some PLC version. In that cases, updating/removing the **parent** data will affect the **child** in different ways.

- **Updating**: all changes will be reproduced in the child's data;

- **Removing**: if there is any dependent on the data to be removed, the system's default behavior is to prevent the action, returning an error/conflict code, such as `409`. However, in some requests, it is possible to force the removal of dependents. For example, when removing **PLC Versions** it is possible to inform a *boolean* parameter `delDependents`. If `delDependents` is set to `true`, all dependents will be removed.

## Device Models

PLCs have several ports where different devices can be connected. Each port has two basic characteristics: `io` (*input* or *output*) and `type` (*digital* or *analog*). These characteristics make it possible to create groups of ports compatible with certain `models` of devices.

Device `models` are used to describe how a device works, how to understand its data and how the Arduino should interact with it.

Depending on the port the device is connected to, there are specific `models` that can be used. See the table below for the `models` supported by each set of ports.

|            |  Digital  |   Analog  |
|:----------:|:---------:|:---------:|
|  **Input** | 'GENERIC' | 'GENERIC' |
| **Output** | 'GENERIC' |           |

## REST API Features

### Auth

Auth routes handle the work related to authentication and authorization.

User sessions are stored server-side, using [express-session](https://github.com/expressjs/session) package and [Redis](https://redis.io/) database as session storage.

#### Login

Authenticates users to the system and sets a client-side session cookie. The user must login with their **username / email** (loginId) and **password**.

- Route: `/auth/login`
- Method: `POST`
- Body Example:
  ```JSON
  {
    "loginId": "mark@gmail.com",
    "password": "5uper_S3cr3t_P4s5"
  }
  ```

#### Logout

Logs out the user out of the system and removes the client-side session cookie.

- Route: `/auth/logout`
- Method: `GET`

#### Check Auth
Verifies whether the current client is authenticated, with an ongoing session. Returns a JSON with boolean value `isAuth` (`false`: not logged, `true`: logged).

- Route: `/auth`
- Method: `GET`
- Return Example:
  ```JSON
  {
    "isAuth": false
  }
  ```

### User

User routes handle work related to user data manipulation.

- **Schema:**
  ```JS
  {
    name: String,
    username: String,
    email: String,
    password: String,
    role:{
      type: String,
      enum: ['MASTER', 'ADMIN', 'DEFAULT']
    },
    createdAt: Date
  }
  ```

#### Create

Creates new user.

- Route: `/user`
- Method: `POST`
- Body Example:
  ```JSON
  {
    "name": "John Marston",
    "username": "John73",
    "email": "john.mars@gmail.com",
    "password": "5uper_S3cr3t_P4s5",
    "role": "DEFAULT"
  }
  ```

#### Show all

Return all users.

- Route: `/user`
- Method: `GET`

#### Get by ID

Return one user by ID.

- Route: `/user/:id`
- Method: `GET`

#### Get by Session

If there's a session ongoing, return user data from current session. Otherwise, returns Status Code [401](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401) (Unauthorized) with an error message.

- Route: `/user/session`
- Method: `GET`

#### Update

Update user data by ID.

- Route: `/user/:id`
- Method: `PUT`
- Payload Example:
  ```JSON
  {
    "name": "Just Marie",
    "username": "NewMarie97",
    "password": "PassT35t@457"
  }
  ```

#### Delete

Delete user by ID.

- Route: `/user/:id`
- Method: `DELETE`


### PLC Version

PLC Version routes handle work related to PLC Versions management.

- **Schema:**
  ```JS
  {
    release: String, //Semantic Version (Max Size: 11)
    input:{
      digital: Number,
      analog: Number
    },
    output:{
      digital: Number,
      analog: Number
    },
    createdAt: Date
  }
  ```

#### Create

Creates new PLC version.

- Route: `/plc/version`
- Method: `POST`
- Body: (**Mandatory**)
  ```JSON
  {
    "release": "1.2.0",
    "input":{
      "digital": 5,
      "analog": 3
    },
    "output":{
      "digital": 7
    }
  }
  ```

#### Get Many

Returns many PLC versions. A filter can be provided to narrow the results (applies to all items, if not provided).

- Route: `/plc/version/many`
- Method: `GET`
- Query: `Filter` (**Optional**), `projection` (**Optional**)

#### Get One

Returns one PLC version, based on provided filter.

- Route: `/plc/version`
- Method: `GET`
- Query: `Filter` (**Mandatory**), `projection` (**Optional**)

#### Update Many

Updates many PLC versions. A filter can be provided to narrow the results (applies to all items, if not provided).

- Route: `/plc/version/many`
- Method: `PUT`
- Query: `Filter` (**Optional**)
- Body: (**Mandatory**)
  ```JSON
  {
    "name": "7.9.2",
    "input":{
      "digital": 10
    }
  }
  ```

#### Update One

Updates one PLC version, based on provided filter.

- Route: `/plc/version`
- Method: `PUT`
- Query: `Filter` (**Mandatory**)
- Body: (**Mandatory**)

#### Delete Many

Deletes many PLC versions. A filter can be provided to narrow the results (applies to all items, if not provided). The Boolean value `delDependents` can be provided to force the deletion of dependent PLCs.

- Route: `/plc/version/many`
- Method: `DELETE`
- Query: `Filter` (**Optional**), `delDependents` (**Optional**)

#### Delete One

Deletes one PLC version data, based on provided filter. The Boolean value `delDependents` can be provided to force the deletion of dependent PLCs.

- Route: `/plc/version`
- Method: `DELETE`
- Query: `Filter` (**Mandatory**), `delDependents` (**Optional**)

### PLC

PLC routes handle work related to PLC management.

- **PLC Schema:**
  ```JS
  {
    reference: String, //Hexadecimal number
    name: String,
    version:{          //PLC version Object
      release: String, //Semantic Version (Max Size: 11)
      input:{
        digital: Number,
        analog: Number
      },
      output:{
        digital: Number,
        analog: Number
      },
      createdAt: Date
    },
    devices:{
      input:{
        digital: [Device],
        analog: [Device]
      },
      output:{
        digital: [Device],
        analog: [Device]
      }
    }
  }
  ```

- **Device Schema:**
  ```JS
  {
    model: String,
    port: Number
  }
  ```

#### Create

The creation of the PLC is not managed directly by the REST API. Instead, PLCs are registered and logged in automatically, via websockets connection.

However, if the server is started in `development` mode, a route for creating PLCs for testing will be available.

- Route: `/plc`
- Method: `POST`
- Body: (**Mandatory**)
  ```JSON
  {
    "reference": "7b18",
    "version":{
      "release": "1.2.0"
    }
  }
  ```

#### Get Many

Returns many PLCs. A filter can be provided to narrow the results (applies to all items, if not provided).

- Route: `/plc/many`
- Method: `GET`
- Query: `Filter` (**Optional**), `projection` (**Optional**)

#### Get One

Returns one PLC, based on provided filter.

- Route: `/plc`
- Method: `GET`
- Query: `Filter` (**Mandatory**), `projection` (**Optional**)

#### Update Many

Updates many PLCs. Can update just the name. A filter can be provided to narrow the results (applies to all items, if not provided).

- Route: `/plc/many`
- Method: `PUT`
- Query: `Filter` (**Optional**)
- Body: (**Mandatory**)
  ```JSON
  {
    "name": "Genesis"
  }
  ```

#### Update One

Updates one PLC version, based on provided filter. Can update just the name.

- Route: `/plc`
- Method: `PUT`
- Query: `Filter` (**Mandatory**)
- Body: (**Mandatory**)

#### Delete Many

Deletes many PLCs . A filter can be provided to narrow the results (applies to all items, if not provided).

- Route: `/plc/many`
- Method: `DELETE`
- Query: `Filter` (**Optional**)

#### Delete One

Deletes one PLC, based on provided filter.

- Route: `/plc`
- Method: `DELETE`
- Query: `Filter` (**Mandatory**)


#### Add Device

Adds a device to a PLC, based on provided filter. In the call of the route, the `io` (*input* or *output*) and `type` (*digital* or *analog*) must be specified. Depending on `io` and `type` there are some valid `models` for the device. See [Device Models](#device-models) for further information.

- Route: `/plc/devices/:io/:type`
- Method: `POST`
- Query: `Filter` (**Mandatory**)
- Body: (**Mandatory**)
  ```JSON
  {
    "model": "GENERIC",
    "port": 0
  }
  ```

#### Delete Devices

Removes devices from specific ports of a PLC, based on the filter provided. In the call of the route, the `io` (*input* or *output*) and `type` (*digital* or *analog*) must be specified. The string value `ports` must be provided, containing the port numbers (space-separated) to be released.

- Route: `/plc/devices/:io/:type`
- Method: `DELETE`
- Query: `Filter` (**Mandatory**), `ports` (**Mandatory**)