import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nav',
  imports: [NgClass],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
})

export class Nav implements OnInit {
  isCollapsed = true;

  constructor() {}

  ngOnInit(): void{}


}
