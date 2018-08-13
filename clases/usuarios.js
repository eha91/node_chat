class Usuarios {

    constructor() {
        this.personas = [];
        this.empresas = [];
    }

    addPerson(id,nombre,img,clave,email) {
        let persona = {id,nombre,img,clave,email};
        this.personas.push(persona);
    }

    addEmpresa(id,nombre,clave) {
        let empresa = {id,nombre,clave};
        this.empresas.push(empresa);
    }

    getPerson(id) {
        let persona = this.personas.filter(ele => {
            return ele.id === id;
        })[0];

        return persona;

    }

    allPersons(clave) {
        let todo = this.personas.filter(ele => {
            return ele.clave === clave;
        });

        return todo;
    }

    getEmpresa(clave) {
        let empresa = this.empresas.filter(ele => {
            return ele.clave === clave;
        })[0];

        return empresa;

    }

    deletePerson(id) {
        this.personas = this.personas.filter(ele => {
            return ele.id != id;
        })

    }

    deleteEmpresa(id) {
        this.empresas = this.empresas.filter(ele => {
            return ele.id != id;
        })

    }



}

module.exports = {
    Usuarios
}