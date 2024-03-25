const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'covid19India.db')
let database = null
const initializaDBAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('DB running at http:/localhost:3000/')
    })
  } catch (e) {
    console.log(`Error ${e.massege}`)
    process.exit(1)
  }
}

initializaDBAndServer()

app.get('/states/', async (request, response) => {
  const getstatesQuere = `
    SELECT 
    state_id as stateId,
    state_name as stateName,
    population
    FROM state
    ORDER BY
    state_id;
    `
  const state = await database.all(getstatesQuere)
  response.send(state)
})

app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const getstateQuire = `
    SELECT 
    state_id as stateId,
    state_name as stateName,
    population
    FROM state
    WHERE state_id = ${stateId};
    `
  const state = await database.get(getstateQuire)
  response.send(state)
})

app.post('/districts/', async (request, response) => {
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const postdistrictsQuire = `
  INSERT INTO
  district (district_name, state_id, cases, cured, active, deaths)
  VALUES
  ('${districtName}','${stateId}','${cases}','${cured}','${active}','${deaths}'); `
  await database.run(postdistrictsQuire)
  response.send('District Successfully Added')
})
// get id districts
app.get('/districts/:districtId/', async (request, response) => {
  const {districtID} = request.params
  const getdistrictQuire = `
  SELECT 
  district_id as districtId,
  district_name as districtName,
  state_id as stateId,
  cases,
  cured,
  active,
  deaths
  FROM
  district
  WHERE 
  district_id = ${districtID};
  `
  const district = await database.get(getdistrictQuire)
  response.send(district)
})

app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const deletedistrictQuire = `
  DELETE FROM
  district
  WHERE 
   district_id = ${districtId};
  `
  await database.run(deletedistrictQuire)
  response.send('District Removed')
})

// api put

app.put('/districts/:districtId/', async (request, response) => {
  const {districtID} = request.params
  const districtdetails = request.body
  const {districtName, stateId, cases, cured, active, deaths} = districtdetails
  const getdistrictQuire = `
  UPDATE district
  SET 
  district_name = '${districtName}',
  state_id = '${stateId}',
  cases = '${cases}',
  cured = '${cured}',
  active = '${active}',
  deaths = '${deaths}'
  WHERE district_id = ${districtID};`
  await database.run(getdistrictQuire)
  response.send('District Details Updated')
})

app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  const getdistricttotalQuiry = `
  SELECT 
  SUM(cases) as totalCases,
  SUM(cured) as totalCured,
  SUM(active) as totalActive,
  SUM(deaths) as totalDeaths
  FROM district
  WHERE
   state_id = ${stateId};
  `
  const stateArray = await database.get(getdistricttotalQuiry)
  response.send(stateArray)
})
// network error
app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const getstatenameQuire = `
  SELECT
  state.state_name AS stateName
  FROM district INNER JOIN state district.state_id=state.state_id
  WHERE
   district_id=${districtId};
  `
  const stateName = await database.get(getstatenameQuire)
  response.send(stateName)
})
module.exports = app
