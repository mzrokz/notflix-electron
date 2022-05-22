import { ElectronService } from './../core/services/electron/electron.service';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  regexTorrent: RegExp = /torrent\/[0-9]{7}\/[a-zA-Z0-9?%-]*/;
  searchText: string = '';

  searchResult: any = [];

  constructor(
    private router: Router,
    private http: HttpClient,
    private electronService: ElectronService
  ) {
    console.log(process.env);
    console.log('Run in electron');
    console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
    console.log('NodeJS childProcess', this.electronService.childProcess);

    this.registerSearchResponse();
  }

  ngOnInit(): void {
    console.log('HomeComponent INIT');
  }

  search() {
    this.electronService.ipcRenderer.send('searchTorrent', this.searchText);
  }

  registerSearchResponse() {
    this.electronService.ipcRenderer.on(
      'searchTorrentResponse',
      (sender, result) => {
        this.searchResult = result;
      }
    );
  }

  getItemDetails(href) {
    this.electronService.ipcRenderer.send('getItemDetails', href);
  }
}
