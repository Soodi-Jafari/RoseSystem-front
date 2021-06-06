import { Component, OnInit, ViewChild, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { GridDataResult, GridComponent, DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { GroupDescriptor, State, process } from '@progress/kendo-data-query';
import { Idc } from '../../../models/idc';
import { IdcService } from '../../../services/idc.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from 'src/app/models/project';
import * as _ from 'lodash';

@Component({
  selector: 'app-idc-cartable',
  templateUrl: './idc-cartable.component.html',
  styleUrls: ['./idc-cartable.component.css']
})
export class IdcCartableComponent implements OnInit {

@Input() public project: Project;
@Output() idcChanged = new EventEmitter<number>();

isLoading : boolean;
gridView: GridDataResult;
@ViewChild("grid") private grid: GridComponent;
public aggregates: any[] = [{field: 'desciplineName', aggregate: 'count'}];
groups: GroupDescriptor[] = [
{
  field: 'desciplineName',
  aggregates: this.aggregates
}];
idcs: Idc[] 

state: State = {
 group: this.groups
};
  constructor(private idcService : IdcService, private router: Router) {
    this.idcs = [];
   }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.getIdcs();
 }

  getIdcs() : void {    
        this.isLoading = true;
        this.idcService.getListByPost('IdcCartable',this.project)
        .subscribe( (result : any) =>  {
           this.isLoading = false;
           _.forEach(result.data,(m : any) => {
            m.creationDate = new Date(m.creationDate);
           }); 
           this.idcs = result.data;
           this.setGrid(); 
           this.CollapseIdcGridData();
           this.idcChanged.emit(this.idcs.length);
         }, error => {    
          this.isLoading = false;
      });              
  }

  private setGrid(): void {      
    this.gridView = process(this.idcs,this.state);
   
  }

  public dataStateChange(state: DataStateChangeEvent): void {
    if (state && state.group) {
      state.group.map(group => group.aggregates = this.aggregates);
    }
    this.state = state;
    this.setGrid();
  }
  CollapseIdcGridData()
  {
    var grp = _.groupBy(this.idcs,(item: any) => item.desciplineName);
    var idx = 0;
    _.forEach(grp, g => {
      this.grid.collapseGroup(idx.toString());  
      idx++;
    });
  }

  public viewIdc(row: Idc)
  {
     this.router.navigate([`/home/procurement/idc/${row.id}/${row.entityId}/${row.entityType}`]);       
   } 


}
