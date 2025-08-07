import { LightningElement,wire,track} from 'lwc';
import getObj from '@salesforce/apex/relationshipLMController.getObjects';
import upAcc from '@salesforce/apex/relationshipLMController.listAllObjectFieldsWithDataTypes';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class RelationshipLM extends LightningElement {
    allRecords;
    @track showtable = false;
    @track tableData = [];
    @track columns = [
        { label: 'Field API Name', fieldName: 'apiName' },
        { label: 'Label', fieldName: 'label' },
        { label: 'Relationship Name', fieldName: 'relationshipName' },
         { label: 'Filed Type', fieldName: 'type' },
         { label: 'Parent Object', fieldName: 'parentObject' }
    ];
    @wire(getObj) data1({ error, data }) {
        if (data && data.length > 0) {
            this.allRecords = data; // Store the first (and only) item from the list
        } else if (error) {
            this.allRecords = undefined;
            console.error(error);
        }
    };
     filteredRecords = [];
    showDropdown = false;
    searhValue = '';
    handleInput(event) {
        const inputVal = event.detail.value.toLowerCase();
        if (inputVal.length >= 1) {
            this.filteredRecords = this.allRecords.filter(rec =>
                rec.toLowerCase().includes(inputVal)
                );
            this.showDropdown = this.filteredRecords.length > 0;
        } else {
            this.showDropdown = false;
        }
    }
    objSelect = '';
    handleSelect(event) {
        const selectedValue = event.currentTarget.dataset.id; // Get the value from data-id
        //alert(selectedValue);
        this.searhValue = selectedValue;
        this.objSelect = selectedValue; // Update the class property correctly
        //alert(this.objSelect);
        this.showDropdown = false;
   }
   
    handleSave(){
        //alert('Hi'+this.objSelect);
        if(this.filteredRecords.length===0){
            const evt = new ShowToastEvent({
                title: 'Error',
                message: 'Invalid Record',
                variant: 'error',
                mode: 'dismissable'
            });
            this.dispatchEvent(evt);
            this.dispatchEvent(new CloseActionScreenEvent());
        }
        upAcc({objectName: this.objSelect})
        .then(result => {
                if (result.length>0) {
                    this.showtable = true;
                    this.tableData = result;
                    const evt = new ShowToastEvent({
                            title: 'Success',
                            message: 'Relationship Data Fetched Successfully',
                            variant: 'success',
                            mode: 'dismissable'
                    });
                   this.dispatchEvent(evt);
                   /* setTimeout(() => {
                    location.reload();
                        }, 2500);*/
                } 
            })
            .catch(error => {
                console.error(error);
                const evt = new ShowToastEvent({
                            title: 'Success',
                            message: error.body.message,
                            variant: 'success',
                            mode: 'dismissable'
                    });
                   this.dispatchEvent(evt);
            });
    }

    clearSave(){
        this.showtable = false;
        this.searhValue = '';
    }
}