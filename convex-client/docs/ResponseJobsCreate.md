# ResponseJobsCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_jobs_create import ResponseJobsCreate

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseJobsCreate from a JSON string
response_jobs_create_instance = ResponseJobsCreate.from_json(json)
# print the JSON string representation of the object
print(ResponseJobsCreate.to_json())

# convert the object into a dict
response_jobs_create_dict = response_jobs_create_instance.to_dict()
# create an instance of ResponseJobsCreate from a dict
response_jobs_create_from_dict = ResponseJobsCreate.from_dict(response_jobs_create_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


