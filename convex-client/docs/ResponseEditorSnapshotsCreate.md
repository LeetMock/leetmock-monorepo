# ResponseEditorSnapshotsCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_editor_snapshots_create import ResponseEditorSnapshotsCreate

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseEditorSnapshotsCreate from a JSON string
response_editor_snapshots_create_instance = ResponseEditorSnapshotsCreate.from_json(json)
# print the JSON string representation of the object
print(ResponseEditorSnapshotsCreate.to_json())

# convert the object into a dict
response_editor_snapshots_create_dict = response_editor_snapshots_create_instance.to_dict()
# create an instance of ResponseEditorSnapshotsCreate from a dict
response_editor_snapshots_create_from_dict = ResponseEditorSnapshotsCreate.from_dict(response_editor_snapshots_create_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


