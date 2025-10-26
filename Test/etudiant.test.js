import { connect, closeDatabase, clearDatabase } from './setup.js';
import { beforeAll, afterEach, afterAll, describe, it } from '@jest/globals';
import Etudiant from '../model/Etudiant.js';
import request from 'supertest';
import app from '../index.js';
import User from '../Model/User.js';

beforeAll(async () => {
    await connect();
});



afterAll(async () => {
    await clearDatabase();
    await closeDatabase();
}); 



describe('Etudiant API Tests', () => {
    it('POST /etudiants -  creer un etudiant', async () => {
        const res = await request(app)
            .post('/etudiants')
            .send({
                id: 2,
                nom: 'Doe',
                prenom: 'John',
                email: 'john@gg.co',
                matiere :[ 'Math', 'Physique']
            });
        expect(res.statusCode).toEqual(200);
        const etudiant = await Etudiant.findOne({ id: 2 });
        expect(etudiant).not.toBeNull();
        expect(etudiant.nom).toBe('Doe');
        expect(etudiant.prenom).toBe('John');
        expect(etudiant.matiere).toContain('Math');    
    });

        it('GET /etudiants -  recuperer tous les etudiants', async () => {

        const res = await request(app).get('/etudiants');
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].nom).toBe('Doe');
    });

        it('GET /etudiants/:id -  recuperer un etudiant par son id', async () => {

        const res = await request(app).get('/etudiants/2');
        expect(res.statusCode).toEqual(200);
        expect(res.body.nom).toBe('Doe');
    });

        it('PUT /etudiants/:id -  modifier un etudiant par son id', async () => {

        const res = await request(app)
            .put('/etudiants/2')
            .send({
                nom: 'Doe',
                prenom: 'Jane',
                email: 'john@gg.co',
                matiere :[ 'Math', 'Physique']});
                        expect(res.statusCode).toEqual(200);
        const etudiant = await Etudiant.findOne({ id: 2 });

        expect(etudiant.prenom).toBe('Jane');
    });

        it('DELETE /etudiants/:id -  supprimer un etudiant par son id', async () => {

        const res = await request(app).delete('/etudiants/2');
        expect(res.statusCode).toEqual(200);
        const etudiantDeleted = await Etudiant.findOne({ id: 2 });
        expect(etudiantDeleted).toBeNull();


    });
});


describe('Authentification Tests', () => {

    it('POST /users/register -  creer un utilisateur', async () => {
        const res = await request(app)      
            .post('/users/register')
            .send({
                nom: 'Doe',
                prenom: 'Jane',
                email: 'jane@gg.co',
                password: 'password123'
            });
        expect(res.statusCode).toEqual(200);
        const user = await User.findOne({ email: 'jane@gg.co' });
        expect(user).not.toBeNull();
        expect(user.nom).toBe('Doe');
    });

    it('POST /users/login -  connecter un utilisateur', async () => {
        const res = await request(app)      
            .post('/users/login')
            .send({
                email: 'jane@gg.co',
                password: 'password123'
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');       
    });      

});   






