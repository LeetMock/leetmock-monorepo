# ResponseAdminsCreateUserProfile


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_admins_create_user_profile import ResponseAdminsCreateUserProfile

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseAdminsCreateUserProfile from a JSON string
response_admins_create_user_profile_instance = ResponseAdminsCreateUserProfile.from_json(json)
# print the JSON string representation of the object
print(ResponseAdminsCreateUserProfile.to_json())

# convert the object into a dict
response_admins_create_user_profile_dict = response_admins_create_user_profile_instance.to_dict()
# create an instance of ResponseAdminsCreateUserProfile from a dict
response_admins_create_user_profile_from_dict = ResponseAdminsCreateUserProfile.from_dict(response_admins_create_user_profile_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


