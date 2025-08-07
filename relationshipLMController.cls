public class relationshipLMController {
    @AuraEnabled(cacheable=true)
    public static List<String> getObjects(){
        Map<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe();

        List<String> allObjects = new List<String>();

        for (String objectName : globalDescribe.keySet()) {
            if (objectName.endsWith('__c')) {
                allObjects.add(objectName);
            } else {
                allObjects.add(objectName);
            }
        }

        System.debug('All Objects: ' + allObjects);
        return allObjects;
    }
    @AuraEnabled
    public static List<Map<String, String>> listAllObjectFieldsWithDataTypes(String objectName) {
        System.debug(objectName);
        List<Map<String, String>> resultList = new List<Map<String, String>>();
        Map<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe();

        if (!globalDescribe.containsKey(objectName)) {
            System.debug('Invalid object name: ' + objectName);
            return resultList;
        }

        Schema.DescribeSObjectResult objDescribe = globalDescribe.get(objectName).getDescribe();
        Map<String, Schema.SObjectField> fieldsMap = objDescribe.fields.getMap();

        for (String fieldName : fieldsMap.keySet()) {
            Schema.DescribeFieldResult fieldDesc = fieldsMap.get(fieldName).getDescribe();

            if (fieldDesc.getType() == Schema.DisplayType.REFERENCE) {
                // Reference fields may point to multiple parent objects
                List<Schema.SObjectType> refToList = fieldDesc.getReferenceTo();

                for (Schema.SObjectType parentType : refToList) {
                    Schema.DescribeSObjectResult parentDescribe = parentType.getDescribe();

                    for (Schema.ChildRelationship cr : parentDescribe.getChildRelationships()) {
                        if (cr.getChildSObject().getDescribe().getName() == objectName &&
                            String.valueOf(cr.getField()) == fieldName) {
                            Map<String, String> fieldInfo = new Map<String, String>();
                            fieldInfo.put('apiName', fieldName);
                            fieldInfo.put('label', fieldDesc.getLabel());
                            if(fieldDesc.getRelationshipOrder() != null){
                                fieldInfo.put('type', 'Master-Detail');
                            }else{
                                fieldInfo.put('type', 'Lookup');      
                            }
                            fieldInfo.put('parentObject', parentDescribe.getName());
                            fieldInfo.put('relationshipName', cr.getRelationshipName());
                            resultList.add(fieldInfo);
                        }
                    }
                }
            }
        }
        System.debug(resultList);
        return resultList;
    }
}