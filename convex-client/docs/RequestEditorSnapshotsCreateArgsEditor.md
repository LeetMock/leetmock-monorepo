# RequestEditorSnapshotsCreateArgsEditor


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**content** | **str** |  | 
**function_name** | **str** |  | 
**input_parameters** | **List[str]** |  | 
**language** | **str** |  | 
**last_updated** | **float** |  | 

## Example

```python
from convex_client.models.request_editor_snapshots_create_args_editor import RequestEditorSnapshotsCreateArgsEditor

# TODO update the JSON string below
json = "{}"
# create an instance of RequestEditorSnapshotsCreateArgsEditor from a JSON string
request_editor_snapshots_create_args_editor_instance = RequestEditorSnapshotsCreateArgsEditor.from_json(json)
# print the JSON string representation of the object
print(RequestEditorSnapshotsCreateArgsEditor.to_json())

# convert the object into a dict
request_editor_snapshots_create_args_editor_dict = request_editor_snapshots_create_args_editor_instance.to_dict()
# create an instance of RequestEditorSnapshotsCreateArgsEditor from a dict
request_editor_snapshots_create_args_editor_from_dict = RequestEditorSnapshotsCreateArgsEditor.from_dict(request_editor_snapshots_create_args_editor_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


