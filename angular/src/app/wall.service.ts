import { Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/auth';

import { Observable } from '../../node_modules/rxjs';
import { AngularFireDatabase, AngularFireList, AngularFireObject  } from '../../node_modules/@angular/fire/database';
import { Wall } from './entity/wall/wall.model';
import { WallPost } from './entity/wall/wall-post.model';

@Injectable({
  providedIn: 'root'
})
export class WallService {

  dbPath: string = '/walls/';

  constructor(public afAuth: AngularFireAuth, private db: AngularFireDatabase) { }

  getList() {
    return this.db.list(this.dbPath).snapshotChanges();
  }

  insertWall(wallObj) {
    this.db.list(this.dbPath).push(wallObj);
  }

  deleteWall(key: string) {
    this.db.list(this.dbPath).remove(key);
  }

  getWallByKey(key) {
    let path = this.dbPath;
    return this.db.list(path, ref => ref.orderByChild('fk_event').equalTo(key)).snapshotChanges().map(snapshot => {
      return snapshot.map(c => ({key: c.payload.key, ...c.payload.val()}));
    });
  }

  insertPost(postsObj, key) {
    postsObj.creationDate = new Date().getTime();
    this.db.list(this.dbPath+key+"/posts/").push(postsObj);
  }

  deletePost(wallKey, postObj: WallPost) {
    this.db.list(this.dbPath+wallKey+"/posts/").remove(postObj.key);
  }

}
