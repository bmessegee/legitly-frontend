import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product',
  imports: [],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent {
  public params:any;
  constructor(private route: ActivatedRoute) {
    this.route.queryParamMap
      .subscribe((p:any) => {
        this.params = p['params'];
        console.log("The params: " + this.params['id']);
        //this.paramKeys = p.keys;
      }
    );
  }
}
