import { NgModule } from "@angular/core";

//Angular material
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';


@NgModule({
    imports:[
        MatInputModule,
        MatFormFieldModule,
        MatCardModule,
        MatButtonModule,
        MatBadgeModule,
        MatToolbarModule,
        MatIconModule,
        MatExpansionModule,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        MatDialogModule,
        MatSelectModule
    ],
    exports:[
        MatInputModule,
        MatFormFieldModule,
        MatCardModule,
        MatButtonModule,
        MatBadgeModule,
        MatToolbarModule,
        MatIconModule,
        MatExpansionModule,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        MatDialogModule,
        MatSelectModule
    ]
})
export class AngularMaterialModule{
}