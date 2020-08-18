import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { STChange, STColumn, STComponent, STData } from '@delon/abc';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { Client } from '../../common/model/client';
import { ClientService } from '../../common/service/client.service';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientListComponent implements OnInit {

  query: any = {
    pi: 0,
    ps: 0,
    sorter: '',
    status: null,
    statusList: [],
    param1: '',
    param2: '',
  };

  client: Client = new Client();
  data: any[] = [];
  selectedRows: STData[] = [];

  loading = false;
  expandForm = false;
  totalCallNo = 0;
  total = 0;

  @ViewChild('st', { static: true }) st: STComponent;
  columns: STColumn[] = [
    { title: '', index: 'key', type: 'checkbox' },
    { title: 'Name', index: 'name' },
    { title: 'Phone', index: 'telno' },
    { title: 'Area', index: 'area' },
    { title: 'Address', index: 'address' },
    { title: 'Remark', index: 'remark' },
    {
      title: 'Operations',
      buttons: [
        {
          text: 'View',
          click: (item: any) => {
            this.router.navigate(['/client/detail'], { queryParams: { id: item.id } });
          },
        },
        {
          text: 'Delete',
          click: (item: any) => {
            this.showDeleteConfirm(item.id);
          },
        },
      ],
    },
  ];

  constructor(
    public messageService: NzMessageService,
    private modalService: NzModalService,
    private changeDetectorRef: ChangeDetectorRef,
    private clientService: ClientService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.loading = true;
    this.clientService.getQueryList(this.query.param1, this.query.param2)
      .subscribe((response: any) => {
        this.data = response.data;
        this.loading = false;
        this.changeDetectorRef.detectChanges();
      });
  }

  stChange(event: STChange) {
    switch (event.type) {
      case 'checkbox':
        this.selectedRows = event.checkbox!;
        this.totalCallNo = this.selectedRows.reduce((total, cv) => total + cv.callNo, 0);
        this.changeDetectorRef.detectChanges();
        break;
      case 'filter':
        this.getData();
        break;
    }
  }

  add(tpl: TemplateRef<{}>) {
    this.modalService.create({
      nzTitle: '',
      nzContent: tpl,
      nzOnOk: () => {
        this.loading = true;
        this.clientService.create(this.client)
          .subscribe(() => this.getData());
      },
    })
  }

  create() {
    this.router.navigate(['/client/detail']);
  }

  remove(id: number) {
    this.clientService.delete(id).subscribe(() => {
      this.getData();
      this.st.clearCheck();
    });
  }

  reset() {
    this.query.param1 = '';
    this.query.param2 = '';
    this.getData();
  }

  showDeleteConfirm(id: number): void {
    this.modalService.confirm({
      nzTitle: 'Are you sure to delete?',
      nzContent: '<b style="color: red;"></b>',
      nzOkText: 'Sure',
      nzOkType: 'danger',
      nzOnOk: () => {
        console.log('OK');
        this.remove(id);
      },
      nzCancelText: 'Cancel',
      nzOnCancel: () => console.log('Cancel')
    });
  }
}